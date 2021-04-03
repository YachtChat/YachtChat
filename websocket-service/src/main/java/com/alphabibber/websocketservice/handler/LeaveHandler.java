package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.LeaveAnswer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.Session;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;

public class LeaveHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    public void handleLeave(Map<String, User> room, Session session) {
        room.remove(session.getId());
        LeaveAnswer leaveAnswer = new LeaveAnswer(session.getId());
        ArrayList<User> users = new ArrayList<>(room.values());

        users.forEach(user -> {
            if (user.getSession().getId() == session.getId()){return;}// this should only skip this iteration
            synchronized (user) {
                try{
                    user.getSession().getBasicRemote().sendObject(leaveAnswer);
                } catch (EncodeException | IOException e) {
                    log.error("Could not send new Position to {}", user.getId());
                    log.error(String.valueOf(e.getStackTrace()));
                }
            }
        });

        try {
            session.close();
        } catch (IOException e) {
            log.error("Could not end connection to {}", session.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }
    }
}
