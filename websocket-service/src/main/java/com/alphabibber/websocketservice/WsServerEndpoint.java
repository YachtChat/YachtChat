package com.alphabibber.websocketservice;

import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.LoginAnswer;
import com.alphabibber.websocketservice.model.answer.NewUserAnswer;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
@ServerEndpoint(value = "/room/{roomID}")
public class WsServerEndpoint {
    private Logger log = LoggerFactory.getLogger(this.getClass());
    private Gson gson = new Gson();


    // Have a look at the ConcurrentHashMap here:
    // https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html
    // https://www.baeldung.com/java-concurrent-map
    // Keep in mind the load factor and the concurrency level
    private static Map<String, Map<String, User>> roomMap = new ConcurrentHashMap<>(8);

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .build();

    @OnOpen
    public void openOpen(@PathParam("roomID") String roomId, Session session) throws IOException{
        // Get the room form the roomMap
        Map room = roomMap.get(roomId);
        // Check if the room exist if not create a new set for it
        if (room == null){
            // create new Map for room
            room = new ConcurrentHashMap<>(8);
            roomMap.put(roomId, room);
            log.info("Room {} newly opend", roomId);
        }
        log.info("User {} joined the room {}", session.getId(), roomId);
    }

    @OnMessage
    public void openMessage(@PathParam("roomId") String roomId, Session session, String message) throws IOException, InterruptedException {
        JsonObject jsonObject = new JsonParser().parse(message).getAsJsonObject();

        String type = jsonObject.get("type").getAsString();

        switch (type){
            case "login":
                int secret = jsonObject.get("user_secret").getAsInt();
                handleLogin(roomId, secret, session);
        }

    }

    @OnClose
    public void onClose(Session session) {
        System.out.println("Connection closure");
    }

    private void handleLogin(String roomId, int secret, Session session) throws IOException, InterruptedException {
        // Check if the user is allowed to enter the room
        String url = "localhost:8081/spaces/" + roomId + "/canUserJoin?userId=" + secret;
        HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create(url))
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        JsonObject jsonObject = new JsonParser().parse(response.body()).getAsJsonObject();
        boolean isAllowed = jsonObject.get("valid").getAsBoolean();
        if (!isAllowed) {
            // if the user is not allowed to enter the room the websocket connection will be closed
            session.close();
            return;
        }
        // add user to room
        Map room = roomMap.get(roomId);
        room.put(session.getId(), new User(session));

        // tell the user that he was added to the room
        LoginAnswer loginAnswer = new LoginAnswer(true, new ArrayList<User>(room.values()));
        try{
            session.getBasicRemote().sendObject(gson.toJson(loginAnswer, LoginAnswer.class));
        } catch (EncodeException e) {
            e.printStackTrace();
        }

        // tell all other users that a new User joied
        NewUserAnswer newUserAnswer = new NewUserAnswer(session.getId());
        ArrayList<User> users = new ArrayList<>(room.values());
        users.forEach(user -> {
            if (user.getSession().getId() == session.getId()){return;}// this should only skip this iteration
            synchronized (user) {
                try{
                    user.getSession().getBasicRemote().sendObject(gson.toJson(newUserAnswer, NewUserAnswer.class));
                } catch (EncodeException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }

}
