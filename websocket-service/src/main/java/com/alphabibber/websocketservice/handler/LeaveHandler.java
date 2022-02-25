package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.WsServerEndpoint;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.LeaveAnswer;
import com.alphabibber.websocketservice.service.PosthogService;
import com.alphabibber.websocketservice.service.SpaceUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.Session;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class LeaveHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final PosthogService posthogService = PosthogService.getInstance();
    private final SpaceUserService spaceUserService = new SpaceUserService();

    public void handleLeave(String spaceID, User sender) {
        // tell posthog that the user left the space
        if (spaceUserService.isUserInSpace(spaceID, sender.getSession().getId())) {
            posthogService.handleLeave(sender, spaceID);
        }

        User user = spaceUserService.removeUserFromSpace(spaceID, sender.getSession().getId());
        LeaveAnswer leaveAnswer = new LeaveAnswer(sender.getId());

        try {
            WsServerEndpoint.broadcast(spaceUserService.getUserSet(spaceID), leaveAnswer, user.getId());
        }  catch (EncodeException | IOException e) {
            log.error("Could not send new Position from {}", sender.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }

        log.info("{}: User has left the room {}", sender.getId(), spaceID);
        try {
            sender.getSession().close();
        } catch (IOException e) {
            log.error("Could not end connection to {}", sender.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }
    }
}
