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
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .build();
    private Logger log = LoggerFactory.getLogger(this.getClass());

    public void handleLogin(Map room, String roomId, String secret, Session session) {

        // Check if the user is allowed to enter the room
        // TODO change to https
        // TODO get this from env variables
        String url = "http://localhost:8081/spaces/" + roomId + "/canUserJoin?userId=" + secret;
        HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create(url))
                .build();

        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            log.error("Spaces server did not answer on {}", url);
//          Todo Howto Error Handling discuss with Chris
            log.error(String.valueOf(e.getStackTrace()));
            return;
        }
        JsonObject jsonObject = JsonParser.parseString(response.body()).getAsJsonObject();
        boolean isAllowed = jsonObject.get("valid").getAsBoolean();

        if (!isAllowed) {
            // if the user is not allowed to enter the room the websocket connection will be closed
            try {
                session.close();
            } catch (IOException e) {
                log.error("Could not exit connection to {}", session.getId());
                log.error(String.valueOf(e.getStackTrace()));
                return;
            }
            log.info("User {} is not allowed to enter the room {}. Connection to him is closed", session.getId(), roomId);
            return;
        }

        User user = new User(session, session.getId());
        room.put(session.getId(), new User(session, session.getId()));

        // tell the user that he was added to the room
        LoginAnswer loginAnswer = new LoginAnswer(true, new ArrayList<User>(room.values()), session.getId());
        try {
            session.getBasicRemote().sendObject(loginAnswer);
        } catch (EncodeException | IOException e) {
          log.error("Could not send Loginmessage to {}", session.getId());
          log.error(String.valueOf(e.getStackTrace()));
        }
        log.info("User {} is now part of room {}", session.getId(), roomId);

        // tell all other users that a new User joied
        NewUserAnswer newUserAnswer = new NewUserAnswer(session.getId(), user.getPosition());
        ArrayList<User> users = new ArrayList<>(room.values());
        // this should only skip this iteration
        users.stream().filter(target -> target.getId() != session.getId()).forEach(target -> {
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
