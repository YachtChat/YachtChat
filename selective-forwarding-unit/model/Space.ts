// class representing a space
import {User} from "./User";
import {Producer, Router} from "mediasoup/node/lib/types";
import {mediaCodecs} from "../config";
import {WORKER} from "../SpaceuserService";
import {logger} from "../logger";

export class Space {
    name: string;
    users: Map<string, User>
    router: undefined | Router;

    constructor(name: string) {
        this.name = name;
        this.users = new Map<string, User>();
    }

    addUser(user: User) {
        this.users.set(user.id, user);
    }
    removeUser(user: User) {
        this.users.delete(user.id);
    }

    async createRouter(){
        this.router = await WORKER!.createRouter({ mediaCodecs, })
    }
    closeRouter(){
        this.router!.close();
    }

    informUsersAboutNewProducer(senderId: string, producerId: string){
        logger.info(this.users.size)
        logger.info(senderId)
        this.users.forEach((value: User, key: string) => {
            if(key !== senderId){
                logger.info('New producer send to ' + key)
                value.socket!.emit('new-producer', { producerId, senderId})
            }
        });
    }

    hasMoreThanOneUser(){
        return this.users.size > 1
    }

    returnAllProducerTransports(){
        return Array.from(this.users.values()).map((user: User) => user.producerTransport).length
    }
    returnAllConsumerTransports(){
        let count = 0
        this.users.forEach(user => {
            count += user.consumerTransports.length
        })
        return count;
    }
    returnAllProducers(){
        let count = 0
        this.users.forEach(user => {
            count += user.producers.length
        })
        return count;
    }
    returnAllConsumers(){
        let count = 0
        this.users.forEach(user => {
            count += user.consumers.length
        })
        return count
    }
    getPeerProducerList(id: string){
        let peerProducerList: any[] = []
        this.users.forEach((user: User, userId: string) => {
            if(userId !== id){
                let producerList: string[] = []
                this.users.get(userId)!.producers.forEach((producer: Producer) => {
                    producerList.push(producer.id)
                })
                peerProducerList.push({userId, producerList})
            }
        })
        return peerProducerList
    }

    handleDisconnectConnection(disconnectedUser: User) {
        this.users.forEach((user: User, userId: string) => {
            if(userId !== disconnectedUser.id){
                logger.info('Disconnecting ' + userId + ' from ' + disconnectedUser.id)
                user.closeConsumerAndConsumerTransportsToUser(disconnectedUser.id)
            }
        })
    }
}