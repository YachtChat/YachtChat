package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.SignalAnswer;
import com.google.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.Session;
import java.io.IOException;
import java.util.Map;

public class SignalHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    public void handleSignal(Map<String, User> room, String roomId, User sender, JsonObject content, String target_id){
        // get User via the target id
        User target = null;
        for (User user:room.values()){
            if (user.getId().equals(target_id)){
                target = user;
                break;
            }
        }
        // check if the user exist
        if(target == null){
            log.error("{}: User tried to signal to target {} but target does not exist", sender.getId(), target_id);
            return;
        }


        SignalAnswer answer = new SignalAnswer(content, sender.getId());
        try {
            synchronized (target){
                target.getSession().getBasicRemote().sendObject(answer);
            }
        } catch (IOException | EncodeException e) {
            log.error("Could not send signaling from {} to {}", sender.getId(), target.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }
        log.info("User {} signaled to user {} in room {}", sender.getId(), target_id, roomId);
    }
}
