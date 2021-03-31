package com.alphabibber.websocketservice;

import com.alphabibber.websocketservice.encoder.*;
import com.alphabibber.websocketservice.handler.LeaveHandler;
import com.alphabibber.websocketservice.handler.PositionChangeHandler;
import com.alphabibber.websocketservice.handler.SignalHandler;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.handler.LoginHandler;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@ServerEndpoint(value = "/room/{roomID}", encoders = { LoginAnswerEncoder.class, NewUserAnswerEncoder.class,
        PositionAnswerEncoder.class, LeaveAnswerEncoder.class, SignalAnswerEncoder.class})
public class WsServerEndpoint {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final LoginHandler loginHandler = new LoginHandler();
    private final PositionChangeHandler positionChangeHandler = new PositionChangeHandler();
    private final LeaveHandler leaveHandler = new LeaveHandler();
    private final SignalHandler signalHandler = new SignalHandler();


    // Have a look at the ConcurrentHashMap here:
    // https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html
    // https://www.baeldung.com/java-concurrent-map
    // Keep in mind the load factor and the concurrency level
    private static final Map<String, Map<String, User>> roomMap = new ConcurrentHashMap<>(8);


    @OnOpen
    public void openOpen(@PathParam("roomID") String roomId, Session session) {
        // Get the room form the roomMap
        Map<String, User> room = roomMap.get(roomId);
        // Check if the room exist if not create a new set for it
        if (room == null){
            // create new Map for room
            room = new ConcurrentHashMap(8);
            roomMap.put(roomId, room);
            log.info("Room {} newly opend", roomId);
        }
        log.info("User {} joined the room {}", session.getId(), roomId);
    }

    @OnMessage
    public void openMessage(@PathParam("roomID") String roomId, Session session, String message)  {
        // TODO should we here catch the exception that are possibly thrown
        JsonObject jsonObject = JsonParser.parseString(message).getAsJsonObject();
        Map<String, User> room = roomMap.get(roomId);
        String type = jsonObject.get("type").getAsString();

        switch (type){
            case "login":
                String secret = jsonObject.get("user_secret").getAsString();
                loginHandler.handleLogin(room, roomId, secret, session);
                break;
            case "position":
                if (! room.containsKey(session.getId())){
                    log.warn("User {} tried to update his Position while not being logged in", session.getId());
                    return;
                }
                String position = jsonObject.get("position").getAsString();
                positionChangeHandler.handlePositinChange(roomMap.get(roomId), roomId, session, position);
                break;
            case "signal":
                if (! room.containsKey(session.getId())){
                    log.warn("User {} tried to signal while not being logged in", session.getId());
                    return;
                }
                String content = jsonObject.get("content").getAsString();
                String target_id = jsonObject.get("target_id").getAsString();
                signalHandler.handleSignal(roomMap.get(roomId), roomId, session, content, target_id);
                log.info("User {} send message to user {} in room {}", session.getId(), target_id, roomId);
                break;
            case "leave":
                if (! room.containsKey(session.getId())){
                    log.warn("User {} tried to leave while not being logged in", session.getId());
                    return;
                }
                leaveHandler.handleLeave(roomMap.get(roomId), session);
                log.info("User {} has left the room {}", session.getId(), roomId);
                break;
        }

    }

    @OnClose
    public void onClose(@PathParam("roomID") String roomId, Session session) throws IOException {
        leaveHandler.handleLeave(roomMap.get(roomId), session);
        log.info("User {} has left the room {}", session.getId(), roomId);
    }

}
