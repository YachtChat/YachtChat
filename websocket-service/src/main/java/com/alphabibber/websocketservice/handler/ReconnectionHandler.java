package com.alphabibber.websocketservice.handler;

import java.io.IOException;
import java.util.Map;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.LeaveAnswer;
import com.alphabibber.websocketservice.model.answer.ReconnectionAnswer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;

public class ReconnectionHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    /**
     * Handler tells sender that the target left and tells the target that the sender left.
     * then Handler tells sender that the target joined and tells the target that the sender joined
     * @param room
     * @param sender: the previous caller
     * @param userId: id of the previous callee
     */
    public void handleReconnection(Map<String, User> room, User sender, String userId){

        User target = null;
        for (User u: room.values()){
            if (u.getId().equals(userId)) target = u;
        }

        LeaveAnswer answerToSender = new LeaveAnswer(target.getId());
        LeaveAnswer answerToTarget = new LeaveAnswer(sender.getId());
        synchronized (sender){
            try{
                sender.getSession().getBasicRemote().sendObject(answerToSender);
            } catch( EncodeException | IOException e){
                log.error("Could not send reconnection answer to {}", sender.getId());
                log.error(String.valueOf(e.getStackTrace()));
            }
        }

        synchronized (target){
            try{
                target.getSession().getBasicRemote().sendObject(answerToTarget);
            } catch( EncodeException | IOException e){
                log.error("Could not send reconnection answer to {}", target.getId());
                log.error(String.valueOf(e.getStackTrace()));
            }
        }
        try{
//            waiting here might not be necessary
            Thread.sleep(2000);
        }catch(InterruptedException ex) {
            Thread.currentThread().interrupt();
        }

        ReconnectionAnswer reconnectionAnswerToSender = new ReconnectionAnswer(target.getId(), target.getPosition(), true);
        ReconnectionAnswer reconnectionAnswerToTarget = new ReconnectionAnswer(sender.getId(), sender.getPosition(), false);

        synchronized (sender){
            try{
                sender.getSession().getBasicRemote().sendObject(reconnectionAnswerToSender);
            } catch( EncodeException | IOException e){
                log.error("Could not send reconnection answer to {}", sender.getId());
                log.error(String.valueOf(e.getStackTrace()));
            }
        }

        synchronized (target){
            try{
                target.getSession().getBasicRemote().sendObject(reconnectionAnswerToTarget);
            } catch( EncodeException | IOException e){
                log.error("Could not send reconnection answer to {}", target.getId());
                log.error(String.valueOf(e.getStackTrace()));
            }
        }
    }

}
