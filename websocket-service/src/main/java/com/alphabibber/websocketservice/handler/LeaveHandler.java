package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.Session;
import java.io.IOException;
import java.util.Map;

public class LeaveHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    public void handleLeave(Map<String, User> room, Session session) {
        room.remove(session.getId());
        try {
            session.close();
        } catch (IOException e) {
            log.error("Could not end connection to {}", session.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }
    }
}
