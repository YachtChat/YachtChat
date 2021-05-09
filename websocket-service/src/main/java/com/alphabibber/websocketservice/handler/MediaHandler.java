package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.MediaAnswer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.Session;
import java.io.IOException;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Map;

public class MediaHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    public void handleMedia(Map<String, User> room, Session session, String media, Boolean event) {
        MediaAnswer answer;
        User changedUser = room.get(session.getId());
        switch (media){
            case "image":
                changedUser.setImage(event);
                answer = new MediaAnswer(session.getId(), media, event);
                break;
            default:
                log.error("The media " + media + " is not known.");
                return;
        }

        ArrayList<User> users = new ArrayList<>(room.values());
        users.forEach(user -> {
            if (user.getId() == changedUser.getId()){return;}
            synchronized (user){
                try{
                    user.getSession().getBasicRemote().sendObject(answer);
                } catch (EncodeException | IOException e) {
                    log.error("Could not send media {} with event {} to user {}.", media, event, user.getId());
                }
            }
        });
    }
}
