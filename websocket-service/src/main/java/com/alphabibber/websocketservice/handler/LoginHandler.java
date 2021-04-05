package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.LoginAnswer;
import com.alphabibber.websocketservice.model.answer.NewUserAnswer;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.Session;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Map;

public class LoginHandler {
    private final String URL = System.getenv("SPACES_URL");
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .build();
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    public void handleLogin(Map<String, User> room, String roomId, String token, String userId, Session session) {

        // Check if the user is allowed to enter the room
        String requestUrl = "https://" + URL + "/spaces/" + roomId + "/canUserJoin?userId=" + userId;
        HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create(requestUrl))
                .header("authorization", "Bearer " + token)
                .build();

        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            log.error("Spaces server did not answer on {}", requestUrl);
//          Todo Howto Error Handling discuss with Chris
            log.error(String.valueOf(e.getStackTrace()));
            return;
        }
        JsonObject jsonObject = JsonParser.parseString(response.body()).getAsJsonObject();
        boolean isAllowed = jsonObject.get("valid").getAsBoolean();

        if (!isAllowed) {
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
                log.error("A user with id: {} is already part of room {}", userId, roomId);
                return;
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

        // tell all other users that a new User joied
        NewUserAnswer newUserAnswer = new NewUserAnswer(user.getId(), user.getPosition());
        ArrayList<User> users = new ArrayList<>(room.values());
        // this should only skip this iteration
        users.stream().filter(target -> target.getId() != user.getId()).forEach(target -> {
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
