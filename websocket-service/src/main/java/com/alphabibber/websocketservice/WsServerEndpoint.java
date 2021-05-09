package com.alphabibber.websocketservice;

import com.alphabibber.websocketservice.encoder.*;
import com.alphabibber.websocketservice.handler.*;
import com.alphabibber.websocketservice.model.Position;
import com.alphabibber.websocketservice.model.User;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@ServerEndpoint(value = "/room/{roomID}", encoders = { LoginAnswerEncoder.class, NewUserAnswerEncoder.class,
        PositionAnswerEncoder.class, LeaveAnswerEncoder.class, SignalAnswerEncoder.class, MediaAnswerEncoder.class})
public class WsServerEndpoint {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    Gson gson = new GsonBuilder().create();
    private final LoginHandler loginHandler = new LoginHandler();
    private final PositionChangeHandler positionChangeHandler = new PositionChangeHandler();
    private final LeaveHandler leaveHandler = new LeaveHandler();
    private final SignalHandler signalHandler = new SignalHandler();
    private final MediaHandler mediaHandler = new MediaHandler();


    // Have a look at the ConcurrentHashMap here:
    // https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html
    // https://www.baeldung.com/java-concurrent-map
    // Keep in mind the load factor and the concurrency level
    private static final Map<String, Map<String, User>> roomMap = new ConcurrentHashMap<>(8);


    @OnOpen
    public void openOpen(@PathParam("roomID") String roomId, Session session) {
        // increase the idle timeout time otherwise the user will be disconnected after a minute
        // set to 10 hours
        session.setMaxIdleTimeout(36000000);

        // Get the room form the roomMap
        Map<String, User> room = roomMap.get(roomId);
        // Check if the room exist if not create a new set for it
        if (room == null){
            // create new Map for room
            room = new ConcurrentHashMap(8);
            roomMap.put(roomId, room);
            log.info("Room {} newly opend", roomId);
        }
        log.info("User joined the room {}", roomId);
    }

    @OnMessage
    public void openMessage(@PathParam("roomID") String roomId, Session session, String message)  {
        // TODO should we here catch the exception that are possibly thrown
        JsonObject jsonObject = JsonParser.parseString(message).getAsJsonObject();
        // Map of room with session.getId() as key and the User Object as value
        Map<String, User> room = roomMap.get(roomId);
        User sender = null;
        String type;
        try{
            type = jsonObject.get("type").getAsString();
        } catch (NullPointerException e){
            log.error("This json does not contain a field type");
            return;
        }

        switch (type){
            case "login":
                String token = jsonObject.get("token").getAsString();
                String userId = jsonObject.get("id").getAsString();
                loginHandler.handleLogin(room, roomId, token, userId, session);
                break;
            case "position":
                if (! room.containsKey(session.getId())){
                    log.warn("User tried to update his Position while not being logged in");
                    return;
                }
                JsonObject positionStr = jsonObject.get("position").getAsJsonObject();
                Position position = gson.fromJson(positionStr, Position.class);
                positionChangeHandler.handlePositinChange(roomMap.get(roomId), roomId, session, position);
                break;
            case "signal":
                if (! room.containsKey(session.getId())){
                    log.warn("User tried to signal while not being logged in");
                    return;
                }
                sender = room.get(session.getId());
                JsonObject content = jsonObject.getAsJsonObject("content");
                String target_id = jsonObject.get("target_id").getAsString();
                // check if the tagertUder.getSession().getId() field is in the room
                User targetUser = null;
                for (User user:room.values()){
                    if (user.getId().equals(target_id)){
                        targetUser = user;
                        break;
                    }
                }
                if (targetUser == null){
                    log.warn("User {} tried to signal to target {} but target does not exist", sender.getId(), target_id);
                    return;
                }
                signalHandler.handleSignal(roomMap.get(roomId), roomId, sender, content, targetUser);
                log.info("User {} send message to user {} in room {}", sender.getId(), target_id, roomId);
                break;
            case "leave":
                if (! room.containsKey(session.getId())){
                    log.warn("User tried to leave while not being logged in");
                    return;
                }
                sender = room.get(session.getId());
                leaveHandler.handleLeave(roomMap.get(roomId), sender);
                log.info("User {} has left the room {}", sender.getId(), roomId);
                break;
            case "media":
                if (! room.containsKey(session.getId())){
                    log.warn("User tried to leave while not being logged in");
                    return;
                }
                sender = room.get(session.getId());
                String media = jsonObject.get("media").getAsString();
                Boolean event = jsonObject.get("event").getAsBoolean();
                mediaHandler.handleMedia(roomMap.get(roomId), session, media, event);
                log.info("User {} changed his media type for {} to {}", sender.getId(), media, event);
                return;
            default:
                log.warn("The {} type is not defined", type);
        }
    }

    @OnClose
    public void onClose(@PathParam("roomID") String roomId, Session session) throws IOException {
        User sender = roomMap.get(roomId).get(session.getId());
        leaveHandler.handleLeave(roomMap.get(roomId), sender);
        log.info("User {} has left the room {}", sender.getId(), roomId);
    }

    @OnError
    public void onError(@PathParam("roomID") String roomId, Session session, Throwable e){
        Throwable cause = e.getCause();
        if (cause != null){
            log.error("error-info -> cause: " + cause);
        }
        if (roomMap.containsKey(roomId)){
            Map<String, User> room = roomMap.get(roomId);
            if (room.containsKey(session.getId())){
                room.remove(session.getId());
            }
        }
        try{
            session.close();
        } catch (IOException ioException) {
            log.info("Error was handeled with cascading IOException");
            ioException.printStackTrace();
        }
        finally {
            log.info("Session error was handled");
        }
    }
}
