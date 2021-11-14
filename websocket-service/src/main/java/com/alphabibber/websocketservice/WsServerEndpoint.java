package com.alphabibber.websocketservice;

import com.alphabibber.websocketservice.encoder.*;
import com.alphabibber.websocketservice.handler.MessageHandler;
import com.alphabibber.websocketservice.handler.*;
import com.alphabibber.websocketservice.model.Position;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.service.SpacesService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.junit.platform.commons.util.ExceptionUtils;
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
        PositionAnswerEncoder.class, LeaveAnswerEncoder.class, SignalAnswerEncoder.class, MediaAnswerEncoder.class,
        MessageEncoder.class, KickAnswerEncoder.class, ReconnectionEncoder.class})
public class WsServerEndpoint {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    Gson gson = new GsonBuilder().create();
    private final PingHandler pingHandler = new PingHandler();
    private final LoginHandler loginHandler = new LoginHandler();
    private final PositionChangeHandler positionChangeHandler = new PositionChangeHandler();
    private final LeaveHandler leaveHandler = new LeaveHandler();
    private final SignalHandler signalHandler = new SignalHandler();
    private final MediaHandler mediaHandler = new MediaHandler();
    private final MessageHandler messageHandler = new MessageHandler();
    private final KickHandler kickHandler = new KickHandler();
    private final ReconnectionHandler reconnectionHandler = new ReconnectionHandler();

    private final SpacesService spacesService = new SpacesService();


    // Have a look at the ConcurrentHashMap here:
    // https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html
    // https://www.baeldung.com/java-concurrent-map
    // Keep in mind the load factor and the concurrency level
    // Concurrent Hashmap probably works good for a Space, it is unclear whether it works good for the roomMap that stores
    // all Spaces.
    private static final Map<String, Map<String, User>> roomMap = new ConcurrentHashMap<>(8);


    @OnOpen
    public void openOpen(@PathParam("roomID") String roomId, Session session) {
        // increase the idle timeout time otherwise the user will be disconnected after a minute
        // set to 10 hours
        session.setMaxIdleTimeout(1000 * 60 * 60);


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

    @OnMessage(maxMessageSize = -1L)
    public void openMessage(@PathParam("roomID") String roomId, Session session, String message)  {
        // get data which the user send
        JsonObject jsonObject = JsonParser.parseString(message).getAsJsonObject();

        // Get room that was created when the user entered the space
        Map<String, User> room = roomMap.get(roomId);

        // check if the user send a type (it probably does not make sense to check this here. Just let it fail.
        if (jsonObject.get("type") == null){
            throw new IllegalArgumentException("Field 'type' should be provided");
        }
        String type = jsonObject.get("type").getAsString();

        // if the user is not yet part of the room the type has to be 'login'
        if (!room.containsKey(session.getId())) {
            if (!type.equals("login")) {
                throw new IllegalArgumentException("If the user is not yet logged in the type should be login");
            }
            String token = jsonObject.get("token").getAsString();
            String userId = jsonObject.get("id").getAsString();
            loginHandler.handleLogin(room, roomId, token, userId, session, pingHandler);
        }

        if (type.equals("ping")){
            pingHandler.handlePing(session.getId());
        }


        // if the user is already logged in the space, it can be various type
        else {
            // get the sender as a User object
            User sender = room.get(session.getId());
            String token;
            String userId;

            JsonObject content;
            String targetId;
            String userMessage;
            switch (type) {
                case "position":
                    JsonObject positionStr = jsonObject.get("position").getAsJsonObject();
                    Position position = gson.fromJson(positionStr, Position.class);
                    positionChangeHandler.handlePositinChange(roomMap.get(roomId), roomId, session, position);
                    break;
                case "signal":
                    content = jsonObject.getAsJsonObject("content");
                    targetId = jsonObject.get("target_id").getAsString();
                    signalHandler.handleSignal(roomMap.get(roomId), roomId, sender, content, targetId);
                    log.info("User {} signaled to user {} in room {}", sender.getId(), targetId, roomId);
                    break;
                case "message":
                    userMessage = jsonObject.get("content").getAsString();
                    targetId = jsonObject.get("target_id").getAsString();
                    messageHandler.handleMessage(roomMap.get(roomId), roomId, sender, userMessage, targetId);
                    log.info("User {} send message to user {} in room {}", sender.getId(), targetId, roomId);
                    break;
                case "leave":
                    leaveHandler.handleLeave(roomMap.get(roomId), sender);
                    log.info("User {} has left the room {}", sender.getId(), roomId);
                    break;
                case "media":
                    String media = jsonObject.get("media").getAsString();
                    Boolean event = jsonObject.get("event").getAsBoolean();
                    mediaHandler.handleMedia(roomMap.get(roomId), sender, media, event);
                    log.info("User {} changed his media type for {} to {}", sender.getId(), media, event);
                    break;
                case "kick":
                    if (! room.containsKey(session.getId())){
                        log.warn("User tried to kick another user while not being in a room");
                        return;
                    }
                    sender = room.get(session.getId());
                    token = jsonObject.get("token").getAsString();
                    userId = jsonObject.get("user_id").getAsString();
                    kickHandler.handleKick(room, roomId, sender, token, userId);
                    log.info("User {} was kicked by {} out of Space {}", userId, sender.getId(), roomId);
                    break;
                case "reconnection":
                    if (! room.containsKey(session.getId())){
                        log.warn("User tried to reconnect to another user while not being in a room");
                        return;
                    }
                    sender = room.get(session.getId());
                    userId = jsonObject.get("user_id").getAsString();
                    reconnectionHandler.handleReconnection(roomMap.get(roomId), sender, userId);
                    log.info("Reconnection between {} and {} was handled", sender.getId(), userId);
                    break;
                default:
                    log.warn("The {} type is not defined", type);
            }
        }
    }

    @OnClose
    public void onClose(@PathParam("roomID") String roomId, Session session) {
        User sender = null;
        try{
            sender = roomMap.get(roomId).get(session.getId());
        } catch (NullPointerException e){
            log.error("Room {} does not exist but user closed connection on that room", roomId);
        }
        if (sender != null){
            leaveHandler.handleLeave(roomMap.get(roomId), sender);
            log.info("User {} has left the room {}", sender.getId(), roomId);
        }
    }

    @OnError
    public void onError(@PathParam("roomID") String roomId, Session session, Throwable t){
        log.error(ExceptionUtils.readStackTrace(t));
        try{
            // This should call the onClose method where the user is then removed from the room
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
