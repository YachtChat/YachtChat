package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.LoginAnswer;
import com.alphabibber.websocketservice.model.answer.NewUserAnswer;
import com.alphabibber.websocketservice.service.SpacesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.Session;
import java.io.IOException;
import java.net.http.HttpClient;
import java.util.ArrayList;
import java.util.Map;

public class LoginHandler {
    private final SpacesService spacesService = new SpacesService();
    private final String URL = System.getenv("SPACES_URL");
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .build();
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final LeaveHandler leaveHandler = new LeaveHandler();

    public void handleLogin(Map<String, User> room, String roomId, String token, String userId, Session session, PingHandler pingHandler) {
        if (!spacesService.isUserAllowedToJoin(roomId, token)) {
            // if the user is not allowed to enter the room the websocket connection will be closed
            try {
                LoginAnswer deniedAnswer = new LoginAnswer(false, new ArrayList<>(), userId);
                session.getBasicRemote().sendObject(deniedAnswer);
                session.close();
            } catch (IOException | EncodeException e) {
                log.error("User {} is not allowed to enter room but could not exit connection", userId);
                log.error(String.valueOf(e.getStackTrace()));
                return;
            }

            log.info("User {} is not allowed to enter the room {}. Connection to him is closed", userId, roomId);
            return;
        }
        // check if a user with the given userId is already part of this room
        for (User user:room.values()){
            if (user.getId().equals(userId)){
                // kick this user that was already in the space
                log.error("A user with id: {} is already part of room {} and will be kicked", userId, roomId);
                leaveHandler.handleLeave(room, user);
            }
        }

        // user is allowed to log in
        User user = new User(session, userId);
        room.put(session.getId(), user);

        // tell the user that he was added to the room
        LoginAnswer loginAnswer = new LoginAnswer(true, new ArrayList<>(room.values()), userId);
        try {
            session.getBasicRemote().sendObject(loginAnswer);
        } catch (EncodeException | IOException e) {
          log.error("Could not send Loginmessage to {}", userId);
          log.error(String.valueOf(e.getStackTrace()));
        }
        log.info("User {} is now part of room {}", userId, roomId);

        // when the user is part of a room we expect him to send a ping every 5 seconds
        pingHandler.initPing(session.getId(), user, room);

        // tell all other users that a new User joined
        NewUserAnswer newUserAnswer = new NewUserAnswer(user.getId(), user.getPosition());
        ArrayList<User> users = new ArrayList<>(room.values());
        // this should only skip this iteration
        users.stream().filter(target -> !target.getId().equals(user.getId())).forEach(target -> {
            synchronized (target) {
                try {
                    target.getSession().getBasicRemote().sendObject(newUserAnswer);
                } catch (EncodeException | IOException e) {
                    log.error("Could not send NewUserMessage to {}", target.getId());
                }
            }
        });
    }
}
