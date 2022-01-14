package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.RangeAnswer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import java.io.IOException;
import java.util.Map;

public class RangeHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    public void handleRange(Map<String, User> room, String sender_id, boolean event, String target_id){
        User sender = room.get(sender_id);

        User target = null;
        for (User user : room.values()) {
            if (user.getId().equals(target_id)) {
                target = user;
                break;
            }
        }

        if (target == null){
            log.error("User {} tried to send range event to {} but target does not exist", sender.getId(), target_id);
            return;
        }

        RangeAnswer answer = new RangeAnswer(sender.getId(), event);
        synchronized (target){
            try{
                target.getSession().getAsyncRemote().sendObject(answer);
            } catch (IllegalArgumentException e) {
                log.error("Could not send range event from {} to {}.", sender.getId(), target.getId());
                log.error(String.valueOf(e.getStackTrace()));
            }
        }
    }
}
