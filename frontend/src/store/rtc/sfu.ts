import io, {Socket} from 'socket.io-client';
import { Device } from 'mediasoup-client';
import {AppThunk, RootState} from "../utils/store";
import {Transport, TransportOptions} from "mediasoup-client/lib/Transport";
import {Producer} from "mediasoup-client/lib/Producer";
import {getStream, setStream} from "../mediaSlice";
import {getOnlineUsers, getUser, getUserID, getUserWrapped, handlePositionUpdate} from "../userSlice";
import {getToken} from "../authSlice";
import {Dispatch} from "react";
import {SFU_PORT, SFU_URL} from "../utils/config";

let device: Device
let rtpCapabilities: any
let socket: Socket | undefined

let producerTransport: Transport | undefined
let consumerTransports: any[] = []

let producerAudio: Producer | undefined
let producerVideo: Producer | undefined

let joined= false

let mediaState: Map<string, Map<string, boolean>> = new Map<string, Map<string, boolean>>()


let mediaStream

let paramsAudio: any = {
    encodings: [
        {
            rid: 'r0',
            maxBitrate: 500000,
        }],
    codecOptions: {
        videoGoogleStartBitrate: 1000
    }
}
let paramsVideo: any = {
    // mediasoup params
    encodings: [
        {
            rid: 'r0',
            maxBitrate: 2500000,
        },
        // {
        //     rid: 'r1',
        //     maxBitrate: 1000000,
        // },
        // {
        //     rid: 'r2',
        //     maxBitrate: 5000000,
        // },
    ],
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
    codecOptions: {
        videoGoogleStartBitrate: 1000
    }
}

export function disconnect(){
    console.log("Socket will be closed and all connection reseted")
    if(socket) socket.close()
    if(producerAudio) producerAudio.close()
    if(producerVideo) producerVideo.close()
    if(producerTransport) producerTransport.close()

    socket = undefined
    producerAudio = undefined
    producerVideo = undefined
    consumerTransports = []
    joined = false
    mediaState = new Map<string, Map<string, boolean>>()
}

export function addTrackToStream(track: MediaStreamTrack){
    if(track.kind == "video"){
        paramsVideo.track = track
        producerTransport!.produce(paramsVideo).then(producer => {
            producer.on('trackended', () => {
                console.log('track ended')

                // close video track
            })
            producer.on('transportclose', () => {
                console.log('transport ended')

                // close video track
            })

            // add track to the local variables
            if(track.kind === 'video'){
                producerVideo = producer
            }
            else if(track.kind === 'audio'){
                producerAudio = producer
            }
        })
    } else{
        paramsAudio.track = track
        producerTransport!.produce(paramsAudio).then(producer => {
            producer.on('trackended', () => {
                console.log('track ended')

                // close audio track
            })
            producer.on('transportclose', () => {
                console.log('transport ended')

                // close audio track
            })

            // add track to the local variables
            if(track.kind === 'video'){
                producerVideo = producer
            }
            else if(track.kind === 'audio'){
                producerAudio = producer
            }
        })
    }
}

export const exchangeTracks = (stream: MediaStream, video: boolean, audio: boolean): AppThunk => (dispatch, getState) => {
    // we don not only need to exchange the tracks here but might also need to start or stop the consumers to specific
    // peers
    // that is because if the user switched f.e. from screenshare to video we might need to send another user our video
    // when it earlier it was not send because of the other user's location
    const user = getUserWrapped(getState())

    if(!socket) return
    if(video){
        if(producerVideo!.track){
            producerVideo!.track.stop()
        }
        producerVideo!.replaceTrack({track: stream.getVideoTracks()[0]})
        // if we are currently not sharing our screen we need to start all consumers consuming our video
        if(!user.screen){
            getOnlineUsers(getState()).forEach(user => {
                updateMediaToId(user.id, true, false)
            })
        }
    }
    if(audio){
        if(producerAudio!.track){
            producerAudio!.track.stop()
        }
        producerAudio!.replaceTrack({track: stream.getAudioTracks()[0]})
    }
}

// if either audio or video is undefined, it won't get changed
export function updateMediaToId(id: string, video: boolean | undefined, audio: boolean | undefined){
    if(!socket) return
    // make the changes
    socket.emit('media', { video, audio, globalTargetId: id })

    // update the state
    if(video !== undefined){
        if(!mediaState.has(id)){
            mediaState.set(id, new Map<string, boolean>().set('video', video))
        } else{
            mediaState.get(id)!.set('video', video)
        }
    }
    if(audio !== undefined){
        if(!mediaState.has(id)){
            mediaState.set(id, new Map<string, boolean>().set('audio', audio))
        } else{
            mediaState.get(id)!.set('audio', audio)
        }
    }
}

// return the media state that should always be in sync with the SFU and therefore the actual state
// if there is no state yet, create one and return the defualt state which is true
export function isSendingMediaTo(id: string, media: "video" | "audio"): boolean{
    if(!mediaState.has(id)){
        mediaState.set(id, new Map<string, boolean>().set(media, true))
    }else{
        if(!mediaState.get(id)!.has(media)){
            mediaState.set(id, mediaState.get(id)!.set(media, true))
        }
    }
    return mediaState.get(id)!.get(media)!
}

export function disconnectUser(id: string) {
    // close and remove the consumerTransport for the disconnected user
    consumerTransports.filter(transportIter => transportIter.globalSenderId == id).forEach(transportIter => {
        transportIter.consumer.close()
    })
    consumerTransports = consumerTransports.filter(transportIter => transportIter.globalSenderId != id)
}


export const handleSpaceJoin = (joinedUserString: string, isCaller: boolean|undefined, spaceId: string): AppThunk => (dispatch, getState) => {
    getToken(getState()).then(token => {
        socket = io(`wss://${SFU_URL}:${SFU_PORT}/${spaceId}/`, { query: {token: token, id: getUserID(getState())}})
        // socket = io(`ws://localhost:4000/${spaceId}/`, { query: {token: token, id: getUserID(getState())}})
        socket.on("connection-success", (data) => {
            console.log(`Connected to server with socket id ${data.socketid}`);
            rtpCapabilities = data.rtpCapabilities
            createDevice(dispatch, getState())
        });

        socket.on('new-producer', ({producerId, senderId, globalSenderId}) => {
            signalNewConsumerTransport(producerId, senderId, globalSenderId, dispatch, getState())
        })

        // TODO this is so ugly this shouldn't be here :( (but it has to be for now)
        dispatch(handlePositionUpdate({id: joinedUserString, position: getUser(getState()).position!}))
    })
}

const createDevice = async (dispatch: Dispatch<any>, state: RootState) => {
    try {
        device = new Device()

        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load
        // Loads the device with RTP capabilities of the Router (server side)
        await device.load({
            // see getRtpCapabilities() below
            routerRtpCapabilities: rtpCapabilities
        })

        console.log('Device RTP Capabilities', device.rtpCapabilities)

        // once the device loads, create transport
        dispatch(createSendTransport())

    } catch (error: any) {
        console.log(error)
        if (error.name === 'UnsupportedError')
            console.warn('browser not supported')
    }
}

const createSendTransport = (): AppThunk => (dispatch, getState) => {
    // see server's socket.on('createWebRtcTransport', sender?, ...)
    // this is a call from Producer, so sender = true
    socket!.emit('createWebRtcTransport', { consumer: false }, (params: any) => {
        console.log('createWebRtcTransport', params)
        // The server sends back params needed
        // to create Send Transport on the client side
        if (params.error) {
            console.log(params.error)
            return
        }


        // creates a new WebRTC Transport to send media
        // based on the server's producer transport params
        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
        producerTransport = device.createSendTransport(params.params)
        console.log('Producer Transport created')

        // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
        // this event is raised when a first call to transport.produce() is made
        // see connectSendTransport() below
        producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                // Signal local DTLS parameters to the server side transport
                // see server's socket.on('transport-connect', ...)
                await socket!.emit('transport-connect', {
                    dtlsParameters,
                })

                // Tell the transport that parameters were transmitted.
                callback()

            } catch (error) {
                errback(error)
            }
        })
        producerTransport.on('produce', async (parameters, callback, errback) => {
            console.log(parameters)

            try {
                // tell the server to create a Producer
                // with the following parameters and produce
                // and expect back a server side producer id
                // see server's socket.on('transport-produce', ...)
                await socket!.emit('transport-produce', {
                    kind: parameters.kind,
                    rtpParameters: parameters.rtpParameters,
                    appData: parameters.appData,
                }, ({id, producerExist }: any) => {
                    // Tell the transport that parameters were transmitted and provide it with the
                    // server side producer's id.
                    callback({ id })

                    // if producers exist, then join room
                    console.log('producersExist', producerExist)
                    if (producerExist && !joined){
                        joined = true
                        dispatch(getProducers())
                    }
                })
            } catch (error) {
                errback(error)
            }
        })

        connectSendTransport(dispatch, getState())
    })
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const connectSendTransport = async (dispatch: Dispatch<any>, state: RootState) => {
    // we now call produce() to instruct the producer transport
    // to send media to the Router
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
    // this action will trigger the 'connect' and 'produce' events above
    // initialize the local stream
    paramsAudio.track = undefined
    paramsVideo.track = undefined
    mediaStream = getStream(state, getUserID(state))
    let audioTrack = mediaStream!.getAudioTracks()[0]
    let videoTrack = mediaStream!.getVideoTracks()[0]
    paramsAudio.track = audioTrack
    paramsVideo.track = videoTrack

    if(paramsVideo.track){
        producerVideo = await producerTransport!.produce(paramsVideo)

        producerVideo.on('transportclose', () => {
            console.log('transport ended')

            // close video track
        })

        producerVideo.on('trackended', () => {
            console.log('track ended')

            // close video track
        })
    }
    if(paramsAudio.track){
        await sleep(100)
        producerAudio = await producerTransport!.produce(paramsAudio)
        producerAudio.on('trackended', () => {
            console.log('track ended')

            // close video track
        })
        producerAudio.on('transportclose', () => {
            console.log('transport ended')

            // close video track
        })
    }
}

const getProducers = (): AppThunk => (dispatch, getState) => {
    console.log('getProducers called')
    socket!.emit('get-peers', async (peers: {userId: string, globalSenderId: string, producerList: string[]}[]) => {
        for (const peer of peers) {
            for (const peerTransport of peer.producerList) {
                signalNewConsumerTransport(peerTransport, peer.userId, peer.globalSenderId, dispatch, getState())
                // await sleep(50)
            }
        }
    })
}

const signalNewConsumerTransport = async (serverProducerId: string, newProducerSocketId: string, globalSenderId: string, dispatch: Dispatch<any>, state: RootState) => {
    // see if there is alreay a consumer transport for this peer
    let consumerTransport
    let serverConsumerTransportId

    consumerTransports.forEach(consumerTransportIter => {
        if (consumerTransportIter.newProducerSocketId == newProducerSocketId) {
            consumerTransport = consumerTransportIter.consumerTransport
            serverConsumerTransportId = consumerTransportIter.serverConsumerTransportId
        }
    })

    if (consumerTransport && serverConsumerTransportId) {
        connectRecvTransport(consumerTransport, serverProducerId, globalSenderId, serverConsumerTransportId, newProducerSocketId, dispatch, state)
    }else{
        await socket!.emit('createWebRtcTransport', { isConsumer: true, senderId: newProducerSocketId }, (params: any) => {
            console.log('signalNewConsumerTransport with type consumer')
            // The server sends back params needed
            // to create Send Transport on the client side
            if (params.error) {
                console.log(params.error)
                return
            }
            console.log(`PARAMS... ${params}`)

            let consumerTransport
            try {
                consumerTransport = device.createRecvTransport(params.params)
            } catch (error) {
                // exceptions:
                // {InvalidStateError} if not loaded
                // {TypeError} if wrong arguments.
                console.log(error)
                return
            }

            consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                try {
                    // Signal local DTLS parameters to the server side transport
                    // see server's socket.on('transport-recv-connect', ...)
                    await socket!.emit('transport-recv-connect', {
                        dtlsParameters,
                        consumerTransportId: params.params.id,
                    })

                    // Tell the transport that parameters were transmitted.
                    callback()
                } catch (error) {
                    // Tell the transport that something was wrong
                    errback(error)
                }
            })

            consumerTransport.on('close', () => {

            })

            connectRecvTransport(consumerTransport, serverProducerId, globalSenderId, params.params.id, newProducerSocketId, dispatch, state)
        })
    }
}

const connectRecvTransport = async (consumerTransport: Transport, remoteProducerId: string, globalSenderId: string, consumerTransportId: string, senderSocketId: string, dispatch: Dispatch<any>, state: RootState) => {
    // for consumer, we need to tell the server first
    // to create a consumer based on the rtpCapabilities and consume
    // if the router can consume, it will send back a set of params as below
    await socket!.emit('consume', {
        rtpCapabilities: device.rtpCapabilities,
        producerId: remoteProducerId,
        consumerTransportId,
        senderSocketId,
    }, async ( params: any ) => {
        console.log("consume callback")
        if (params.error) {
            console.log('Cannot Consume')
            return
        }
        params = params.params
        console.log(`id: ${params.id} kind: ${params.kind} rtpParameters: ${params.rtpParameters} producerId: ${params.producerId}`)
        // then consume with the local consumer transport
        // which creates a consumer
        const consumer = await consumerTransport.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters
        })

        consumer.on('producerclose', () => {
            consumer.close()
            console.log("producer closed therefore the consumer closed")
        })
        consumer.on('transportclose', () => {
            consumer.close()
            console.log("transport closed therefore the consumer closed")
        })

        consumerTransports = [
            ...consumerTransports,
            {
                senderSocketId,
                consumerTransportId,
                consumerTransport,
                consumerId: params.id,
                producerId: remoteProducerId,
                globalSenderId,
                consumer,
            },
        ]

        // create a new div element for the new consumer media
        // and append to the video container
        const { track } = consumer
        socket!.emit('consumer-resume', { consumerId: params.id, senderSocketId })

        dispatch(setStream(state, params.globalSenderId, [track]))
    })
}