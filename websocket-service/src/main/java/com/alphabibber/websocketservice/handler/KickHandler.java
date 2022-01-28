package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.KickAnswer;
import com.alphabibber.websocketservice.service.SpacesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import java.io.IOException;
import java.util.Map;

public class KickHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final LeaveHandler leaveHandler = new LeaveHandler();
    private final SpacesService spacesService = new SpacesService();

    public void handleKick(Map<String, User> room, String roomId, User sender, String token, String userId){
        if (!spacesService.isUserHost(roomId, token)){
            log.error("{}: User tried to kick another user for room {} but is no host for that room", sender.getId(), roomId);
            return;
        }
        // check if the user which should be kicked is part of the space
        User user = null;
        for (User u: room.values()){
            if (u.getId().equals(userId)) user = u;
        }
        if (user == null){
            log.warn("{}: User was tried to be kicked but is not part of the room {}", userId, roomId);
            return;
        }

        // User should be deleted from space, if he is deleted from the space he can join the space again by using an
        // invite link
        var removed = spacesService.removeUserFromSpace(roomId, token, userId);
        if (!removed) return;

        // tell the kicker that it was successful
        KickAnswer answer = new KickAnswer(userId);
        try{
            sender.getSession().getBasicRemote().sendObject(answer);
        }  catch (EncodeException | IOException e) {
            log.error("Could not send kick answer to {}", sender.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }
        try{
            user.getSession().getBasicRemote().sendObject(answer);
        }  catch (EncodeException | IOException e) {
            log.error("Could not send kick answer to {}", user.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }
        log.info("User {} was kicked by {} out of Space {}", userId, sender.getId(), roomId);

        // tell the room that a user left
        leaveHandler.handleLeave(roomId, room, user);
    }
}
