import http from 'http';
import { Server } from 'socket.io'
import { logger } from './logger';
import * as spaceuserService from './spaceuserService';
import * as spacesService from './spacesService';

import express, {Express} from 'express';

const PORT:number = Number(process.env.PORT)

// create the http server
const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: { origin: '*' }
});
httpServer.listen(PORT)

// dynamically load the url of the space that is being connected to.
const connections = io.of(/.*/);

// middleware that checks if the clients is allowed to connect to the space
connections.use(async (socket, next) => {
    const spaceName = socket.nsp.name.slice(1, -1)
    const token = <string>socket.handshake.query.token;
    const globalId: string = <string>socket.handshake.query.id;
    if(await spacesService.isUserAllowedToJoinSpace(spaceName, token)){
        await spaceuserService.addUserToSpace(spaceName, socket.id, globalId, socket)
        next()
    }
    else next(new Error('Authentication error'));
})

// set up the websocket listeners
connections.on('connection', async socket => {
    // parse the spaceName
    const spaceName = socket.nsp.name.slice(1, -1)

    // handle socket disconnectiona
    socket.on('disconnect', () => {
        spaceuserService.handleDisconnect(spaceName, socket.id)
    })

    socket.emit('connection-success', {
        socketid: socket.id,
        rtpCapabilities: spaceuserService.getRtpCapabilities(spaceName)
    })

    // endpoint for the client to create a new connection
    socket.on("createWebRtcTransport", async ({ isConsumer, senderId }, callback) => {
        const transport = await spaceuserService.createWebRtcTransportAndReturnParams(spaceName, isConsumer, socket.id, senderId)
        if (transport instanceof Error){
            callback(new Error(transport.message))
        }else{
            callback({
                params: {
                    id: transport.id,
                    iceParameters: transport.iceParameters,
                    iceCandidates: transport.iceCandidates,
                    dtlsParameters: transport.dtlsParameters,
                }
            })
        }
    })
    // handle client transport-connect
    socket.on('transport-connect', async ({dtlsParameters}) => {
        spaceuserService.connectDtlsParameterToProducer(spaceName, socket.id, dtlsParameters)
    })
    // handle client transport-produce
    socket.on('transport-produce', async ({kind, rtpParameters, appData }, callback) => {
        logger.info(`Client ${socket.id} is trying to produce ${kind} in ${spaceName}`)
        let [id, producerExist] = await spaceuserService.createProducer(spaceName, socket.id, {kind, rtpParameters, appData})
        callback({
            id,
            producerExist
        })
    })

    socket.on('transport-recv-connect', async({dtlsParameters, consumerTransportId}) =>{
        logger.info(`Client ${socket.id} is trying to connect to consumer ${consumerTransportId} in ${spaceName}`)
        spaceuserService.connectDtlsParameterToConsumer(spaceName, socket.id, dtlsParameters, consumerTransportId)
    })

    // handle client consume
    socket.on('consume', async ({ rtpCapabilities, producerId, consumerTransportId, senderSocketId }, callback) => {
        let consumer = await spaceuserService.createConsumer(spaceName, socket.id, {rtpCapabilities, producerId, consumerTransportId, senderSocketId})
        if (consumer instanceof Error) {
            callback(new Error(consumer.message))
        } else{
            const params = {
                id: consumer.id,
                producerId,
                rtpParameters: consumer.rtpParameters,
                kind: consumer.kind,
                globalSenderId: spaceuserService.getGlobalUserIdWithSocketId(spaceName, senderSocketId)
            }
            callback({params})
        }
    })
    // handle client consume-resume
    socket.on('consumer-resume', async ({ consumerId, senderSocketId }) => {
        await spaceuserService.resumeConsume(spaceName, socket.id, consumerId, senderSocketId)
        spaceuserService.logInfo()
    })
    // endpoint for the client to ask for other peers
    socket.on('get-peers', callback => {
        const peerProducerList = spaceuserService.getPeerProducerList(spaceName, socket.id)
        console.log(peerProducerList)
        callback(peerProducerList)
    })

    // handle media updates for the clients
    socket.on('media', async ({video, audio, globalTargetId}) => {
        spaceuserService.updateMediaForUser(spaceName, socket.id, globalTargetId, video, audio)
    })

    socket.on('isSendingMedia', async ({globalTargetId, media}, callback) => {
        callback({
           "isSendingMedia": spaceuserService.isSendingMedia(spaceName, socket.id, globalTargetId, media)
        })
    })
})

const app: Express = express();
const port: number = 8888;
// app.get('/test', (req,res) => res.send('Express + TypeScript Server -> SFU'));
app.listen(port, () => {
    console.log(`⚡️[server]: Server (SFU) is running at https://localhost:${PORT}`);
});

app.use('/', (req, res) => {
    res.send('SFU found')
})
