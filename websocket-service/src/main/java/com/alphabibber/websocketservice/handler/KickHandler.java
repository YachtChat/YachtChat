package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.WsServerEndpoint;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.KickAnswer;
import com.alphabibber.websocketservice.service.SpaceUserService;
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
    private final SpaceUserService spaceUserService = new SpaceUserService();

    public void handleKick(String spaceId, String sessionId, String token, String userId){
        User sender = spaceUserService.getUser(spaceId, sessionId);
        if (!spacesService.isUserHost(spaceId, token)){
            log.error("{}: User tried to kick another user for room {} but is no host for that room", sender.getId(), spaceId);
            return;
        }

        // check if the user which should be kicked is part of the space
        if (!spaceUserService.isUserPartOfSpace(spaceId, userId)){
            log.error("{}: User tried to kick another user for room {} but is no part of that room", sender.getId(), spaceId);
            return;
        }

        // User should be deleted from space, if he is deleted from the space he can join the space again by using an
        // invite link
        var removed = spacesService.removeUserFromSpace(spaceId, token, userId);
        if (!removed){
            log.error("{}: User tried to kick another user for room {} but could not remove user from space", sender.getId(), spaceId);
            return;
        }

        // tell the kicker that the kick was successful
        KickAnswer answer = new KickAnswer(userId);
        try {
            WsServerEndpoint.sendToOne(sender, answer);
        } catch (EncodeException | IOException e) {
            log.error("Could not send kick answer to {}", sender.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }

        try{
            WsServerEndpoint.broadcast(spaceUserService.getUserSet(spaceId), answer, sender.getId());
        }  catch (EncodeException | IOException e) {
            log.error("Could not send kick answer to {}", sender.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }
        log.info("User {} was kicked by {} out of Space {}", userId, sender.getId(), spaceId);

        // tell the room that a user left
        leaveHandler.handleLeave(spaceId, sender);
    }
}
