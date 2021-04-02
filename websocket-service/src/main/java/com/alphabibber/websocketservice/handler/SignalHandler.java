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

    public void handleSignal(Map<String, User> room, String roomId, Session session, JsonObject content, String target_id){
        SignalAnswer answer = new SignalAnswer(content, session.getId());
        try {
            room.get(target_id).getSession().getBasicRemote().sendObject(answer);
        } catch (IOException | EncodeException e) {
            log.error("Could not send message from {} to {}", session.getId(), target_id);
            log.error(String.valueOf(e.getStackTrace()));
        }
    }
}