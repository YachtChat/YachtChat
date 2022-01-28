package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.Position;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.PositionAnswer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.Session;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;

public class PositionChangeHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    public void handlePositinChange(Map<String, User> room, String roomId, Session session, Position position){
        User changedUser = room.get(session.getId());
        changedUser.setPosition(position);
        // get user global id for the PositonAnswer id
        PositionAnswer answer = new PositionAnswer(position, changedUser.getId());
        ArrayList<User> users = new ArrayList<>(room.values());
        users.forEach(user -> {
            if (user.getId() == changedUser.getId()){return;}// this should only skip this iteration
            synchronized (user) {
                try{
                    user.getSession().getBasicRemote().sendObject(answer);
                } catch (EncodeException | IOException e) {
                    log.error("{}: Could not send new Position to {}", changedUser.getId(), user.getId());
                    log.error(String.valueOf(e.getStackTrace()));
                }
            }
        });
    }
}
