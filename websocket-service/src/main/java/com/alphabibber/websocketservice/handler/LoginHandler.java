package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.WsServerEndpoint;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.LoginAnswer;
import com.alphabibber.websocketservice.model.answer.NewUserAnswer;
import com.alphabibber.websocketservice.service.PosthogService;
import com.alphabibber.websocketservice.service.SpaceUserService;
import com.alphabibber.websocketservice.service.SpacesService;
import com.alphabibber.websocketservice.service.PosthogService;
import net.minidev.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.Session;
import java.io.IOException;
import java.net.http.HttpClient;
import java.util.*;

public class LoginHandler {
    private final SpacesService spacesService = new SpacesService();
    private final SpaceUserService spaceUserService = new SpaceUserService();
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final LeaveHandler leaveHandler = new LeaveHandler();
    private final PosthogService posthogService = PosthogService.getInstance();

    public void handleLogin(String spaceId, String token, String userId, Session session, boolean video, boolean microphone) {
        if (userId.equals("-1")) {
            log.error("{}: User tried to login with invalid ID", userId);
            return;
        }

        if (!spacesService.isUserAllowedToJoin(spaceId, token)) {
            // if the user is not allowed to enter the room the websocket connection will be closed
            LoginAnswer deniedAnswer = new LoginAnswer(false, new HashSet<User>(), userId);
            try {
                WsServerEndpoint.sendToOne(new User(session, userId, video, microphone), deniedAnswer);
            } catch (EncodeException | IOException e) {
                log.error("{}: Could not send Loginmessage", userId);
                log.error(String.valueOf(e.getStackTrace()));
            }
            try {
                session.close();
            } catch (IOException e) {
                log.error("{}: Could not close websocket connection", userId);
            }
            return;
        }

        // check if a user with the given userId is already part of this room
        Collection<User> users = spaceUserService.getUserSet(spaceId);
        for (User user : users) {
            if (user.getId().equals(userId)) {
                // kick this user that was already in the space
                log.info("{}: Tried to login while already being in the space {}", userId, spaceId);
                leaveHandler.handleLeave(spaceId, user);
            }
        }

        // user is allowed to log in
        User user = new User(session, userId, video, microphone);
        spaceUserService.putUserInSpace(spaceId, user, session.getId());

        // tell the user that he was added to the room
        LoginAnswer loginAnswer = new LoginAnswer(true, spaceUserService.getUserSet(spaceId), userId);

        // handle all the posthog tracking
        posthogService.handleLogin(user, spaceId, spaceUserService.getUserSet(spaceId));

        try {
            WsServerEndpoint.sendToOne(user, loginAnswer);
        } catch (EncodeException | IOException e) {
            log.error("{}: Could not send Login message", userId);
            log.error(userId + " : " + e.getMessage(), e);
        }
        log.info("{}: User is now part of room {}", userId, spaceId);

        // tell all other users that a new User joined
        NewUserAnswer newUserAnswer = new NewUserAnswer(user.getId(), user.getPosition(), video, microphone);
        try {
            WsServerEndpoint.broadcast(spaceUserService.getUserSet(spaceId), newUserAnswer, user.getId());
        }catch (EncodeException | IOException e) {
            log.error("{}: Could not send NewUserMessage when new user joined", userId);
            log.error(String.valueOf(e.getStackTrace()));
        }
    }
}
