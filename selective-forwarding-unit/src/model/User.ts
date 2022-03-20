// class representing a user
import {Socket} from "socket.io";
import {Consumer, Producer, Transport} from "mediasoup/node/lib/types";
import {logger} from "../logger";

export class User {
    id: string;
    globalId: string;
    socket: undefined | Socket;
    consumerTransports: { senderId: string, transport: Transport }[];
    producerTransport: Transport | undefined;
    producers: Producer[];
    consumers: { senderId: string, consumer: Consumer }[];
    spaceName: undefined | string;
    // state of the application the first key is the global Id of the yacht application
    mediaMap: Map<string, Map<string, boolean>>

    constructor(socketId: string, globalId: string, spaceName: string, socket: Socket) {
        this.id = socketId;
        this.globalId = globalId;
        this.socket = socket;
        this.spaceName = spaceName;
        this.consumerTransports = [];
        this.producerTransport = undefined
        this.producers = [];
        this.consumers = [];
        this.mediaMap = new Map();
    }

    addConsumerTransport(senderId: string, transport: Transport) {
        this.consumerTransports.push({senderId, transport});
    }

    createProducerTransport(transport: Transport) {
        this.producerTransport = transport
    }

    connectDtlsParametersToProducer({dtlsParameters}: { dtlsParameters: any }) {
        this.producerTransport!.connect({dtlsParameters})
    }

    connectDtlsParametersToConsumer(dtlsParameters: { dtlsParameters: any }, id: string) {
        const consumerTransport = this.consumerTransports.find(({senderId, transport}) => transport.id === id)
        if (!consumerTransport) {
            logger.error(`Could not find consumer transport with id ${id}`)
            return
        } else {
            consumerTransport.transport.connect({dtlsParameters})
        }
    }

    addProducer(producer: Producer) {
        this.producers.push(producer)
    }

    addConsumer(consumer: Consumer, senderId: string) {
        this.consumers.push({senderId, consumer})
    }

    getConsumerTransportWithId(id: string) {
        const consumerTransport = this.consumerTransports.find(({senderId, transport}) => transport.id === id)
        if (!consumerTransport) {
            logger.error(`Could not find consumer transport with id ${id}`)
            return
        } else {
            return consumerTransport.transport
        }
    }

    getConsumerWithId(id: string) {
        const consumer = this.consumers.find(({senderId, consumer}) => consumer.id === id)
        if (!consumer) {
            logger.error(`Could not find consumer with id ${id}`)
            return
        } else {
            return consumer.consumer
        }
    }

    closeAllConnections() {
        // first close consumers and produces then close all transports
        this.consumers.forEach(({senderId, consumer}) => consumer.close())
        this.consumers = []
        this.producers.forEach(producer => producer.close())
        this.producers = []
        this.consumerTransports.forEach(({senderId, transport}) => transport.close())
        this.consumers = []
        if (this.producerTransport) {
            this.producerTransport.close()
            this.producerTransport = undefined
        }
        this.producerTransport = undefined
    }

    closeConsumerTransportFromUser(fromId: string) {
        logger.info(`consumer length ${this.consumerTransports.length}`)
        this.consumerTransports.filter(({senderId, transport}) => {
            senderId === fromId
        }).forEach(({transport}) => {
            transport.close()
        })
        this.consumerTransports = this.consumerTransports.filter(({senderId, transport}) => senderId !== fromId)
        logger.info(`consumer length ${this.consumerTransports.length}`)
    }

    closeConsumerFromUser(fromId: string) {
        this.consumers.filter(({senderId, consumer}) => {
            senderId === fromId
        }).forEach(({consumer}) => {
            consumer.close()
        })
        this.consumers = this.consumers.filter(({senderId, consumer}) => senderId !== fromId)
    }

    closeConsumerAndConsumerTransportsToUser(fromId: string) {
        this.closeConsumerFromUser(fromId)
        this.closeConsumerTransportFromUser(fromId)
    }

    // id is the global target (NOT the socket.id)
    updateMediaState(id: string, media: "audio" | "video", state: boolean) {
        // if the target is already known we update the state
        if(this.mediaMap.has(id)){
            this.mediaMap.set(id, this.mediaMap.get(id)!.set(media, state))
        } else{
            // if the target is not known we create a new entry
            this.mediaMap.set(id, new Map().set(media, state))
        }
    }

    // each user has a map that keeps track to whom this user is sending media
    getMediaState(id: string, media: "audio" | "video"){
        // if there is no entry for the user we search for we create a new one with the default state, which is true
        if(!this.mediaMap.has(id)){
            this.mediaMap.set(id, new Map().set(media, true))
            return true
        } else{
            if(!this.mediaMap.get(id)!.has(media)){
                this.mediaMap.set(id, this.mediaMap.get(id)!.set(media, true))
                return true
            }else{
                return this.mediaMap.get(id)!.get(media)
            }
        }
    }

    // if video or audio is undefined that means we don't want to update it
    updateMedia(fromId: string, video: boolean, audio: boolean) {
        if (video != undefined) {
            const consumer = this.consumers.find(({senderId, consumer}) => (senderId === fromId) && (consumer.kind === 'video'))!
            if (consumer) {
                video ? consumer.consumer.resume() : consumer.consumer.pause()
            } else {
                logger.warn(`Could not find consumer with id ${fromId} to update video`)
            }

        }
        if (audio != undefined) {
            const consumer = this.consumers.find(({senderId, consumer}) => (senderId === fromId) && (consumer.kind === 'audio'))!
            if (consumer) {
                audio ? consumer.consumer.resume() : consumer.consumer.pause()
            } else {
                logger.warn(`Could not find consumer with id ${fromId} to update audio`)
            }
        }
    }

    isGettingMediaFrom(id: string, media: 'video' | 'audio') {
        const consumerObject = this.consumers.find(({senderId, consumer}) => senderId === id && consumer.kind === media)
        if (!consumerObject) {
            return false
        } else {
            return !consumerObject.consumer.pause()
        }
    }
}

