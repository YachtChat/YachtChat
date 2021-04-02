package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.Session;
import java.io.IOException;
import java.util.Map;

public class LeaveHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    public void handleLeave(Map<String, User> room, User sender) {
        room.remove(sender.getSession().getId());
        try {
            sender.getSession().close();
        } catch (IOException e) {
            log.error("Could not end connection to {}", sender.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }
    }
}
