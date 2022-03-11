import express, {Express} from 'express';
import http from 'http';
import { Server } from 'socket.io'
import { logger } from './logger';
import path from "path";
import * as spaceuserService from './spaceuserService';
import {Consumer} from "mediasoup-client/lib/Consumer";

// create the http server
const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: { origin: '*' }
});
httpServer.listen(4000)

// dynamically load the url of the space that is being connected to.
const connections = io.of(/.*/);

// middleware that checks if the clients is allowed to connect to the space
connections.use(async (socket, next) => {
    const spaceName = socket.nsp.name.slice(1, -1)
    const token = socket.handshake.query.token;
    // TODO make call against spacesserver
    logger.info(`It should be checked whether the token ${token} is allowed to connect to the space` +
        ` ${spaceName}. If it is allowed, the next middleware is called.`)
    if (token === "true") {
        // TODO remember clientId and socketId together??
        await spaceuserService.addUserToSpace(spaceName, socket.id, "thisWillBeTheClientId", socket)
        next()
    } else next(new Error('Authentication error'));
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
            }
            callback({params})
        }
    })
    // handle client consume-resume
    socket.on('consumer-resume', async ({ consumerId }) => {
        await spaceuserService.resumeConsume(spaceName, socket.id, consumerId)
        spaceuserService.logInfo()
    })
    // endpoint for the client to ask for other peers
    socket.on('get-peers', callback => {
        const peerProducerList = spaceuserService.getPeerProducerList(spaceName, socket.id)
        console.log(peerProducerList)
        callback(peerProducerList)
    })

    // handle media updates for the clients
    socket.on('media', async ({video, audio, targetId}) => {
        spaceuserService.toggleMediaForUser(spaceName, socket.id, targetId, video, audio)
    })
})






const app: Express = express();
const PORT: number = 8000;
// app.get('/test', (req,res) => res.send('Express + TypeScript Server -> SFU'));
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server (SFU) is running at https://localhost:${PORT}`);
});

app.use('/test/', express.static(path.join(__dirname, 'test')))