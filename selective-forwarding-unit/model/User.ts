// class representing a user
import {Socket} from "socket.io";
import {Consumer, Producer, Transport} from "mediasoup/node/lib/types";
import {logger} from "../logger";

export class User {
    id: string;
    socket: undefined | Socket;
    consumerTransports: {senderId: string, transport: Transport}[];
    producerTransport: Transport | undefined;
    producers: Producer[];
    consumers: {senderId: string, consumer: Consumer}[];
    spaceName: undefined | string;

    constructor(socketId: string, spaceName: string, socket: Socket){
        this.id = socketId;
        this.socket = socket;
        this.spaceName = spaceName;
        this.consumerTransports = [];
        this.producerTransport = undefined
        this.producers = [];
        this.consumers = [];
    }

    addConsumerTransport(senderId: string, transport: Transport) {
        this.consumerTransports.push({senderId, transport});
    }
    createProducerTransport(transport: Transport) {
        this.producerTransport = transport
    }
    connectDtlsParametersToProducer({dtlsParameters}: { dtlsParameters: any }){
        this.producerTransport!.connect({ dtlsParameters })
    }
    connectDtlsParametersToConsumer(dtlsParameters: { dtlsParameters: any }, id: string){
        const consumerTransport = this.consumerTransports.find(({senderId, transport}) => transport.id === id)
        if(!consumerTransport) {
            logger.error(`Could not find consumer transport with id ${id}`)
            return
        }else{
            consumerTransport.transport.connect({ dtlsParameters })
        }
    }
    addProducer(producer: Producer) {
        this.producers.push(producer)
    }
    addConsumer(consumer: Consumer, senderId: string) {
        this.consumers.push({senderId, consumer})
    }
    getConsumerTransportWithId(id: string){
        const consumerTransport = this.consumerTransports.find(({senderId, transport}) => transport.id === id)
        if(!consumerTransport) {
            logger.error(`Could not find consumer transport with id ${id}`)
            return
        } else{
            return consumerTransport.transport
        }
    }
    getConsumerWithId(id: string){
        const consumer = this.consumers.find(({senderId, consumer}) => consumer.id === id)
        if(!consumer) {
            logger.error(`Could not find consumer with id ${id}`)
            return
        }else{
            return consumer.consumer
        }
    }
    closeAllConnections(){
        // first close consumers and produces then close all transports
        this.consumers.forEach(({senderId, consumer}) => consumer.close())
        this.consumers = []
        this.producers.forEach(producer => producer.close())
        this.producers = []
        this.consumerTransports.forEach(({senderId, transport}) => transport.close())
        this.consumers = []
        this.producerTransport!.close()
        this.producerTransport = undefined
    }

    closeConsumerTransportFromUser(fromId: string){
        logger.info(`consumer length ${this.consumerTransports.length}`)
        this.consumerTransports.filter(({senderId, transport}) => {
            senderId === fromId}).forEach(({transport}) => {
                transport.close()})
        this.consumerTransports = this.consumerTransports.filter(({senderId, transport}) => senderId !== fromId)
        logger.info(`consumer length ${this.consumerTransports.length}`)
    }
    closeConsumerFromUser(fromId: string){
        this.consumers.filter(({senderId, consumer}) => {
            senderId === fromId}).forEach(({consumer}) => {
                consumer.close()})
        this.consumers = this.consumers.filter(({senderId, consumer}) => senderId !== fromId)
    }
    closeConsumerAndConsumerTransportsToUser(fromId: string){
        this.closeConsumerFromUser(fromId)
        this.closeConsumerTransportFromUser(fromId)
    }
    toggleMedia(fromId: string, video: boolean, audio: boolean) {
        // find the consumer with the given id and type should be toggled => paused or resumed
        const consumer = this.consumers.find(({senderId, consumer}) => fromId === senderId && consumer.kind === (video ? "video" : "audio"))
        if (!consumer) {
            logger.error(`Could not find consumer with id ${fromId} for user ${this.id} for type ${video ? 'video' : 'audio'}`)
            return
        }else{
            consumer.consumer.paused ? consumer.consumer.resume() : consumer.consumer.pause()
        }

    }
}

