package com.alphabibber.websocketservice;

import com.alphabibber.websocketservice.encoder.*;
import com.alphabibber.websocketservice.handler.MessageHandler;
import com.alphabibber.websocketservice.handler.*;
import com.alphabibber.websocketservice.model.Position;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.service.SpaceUserService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.junit.platform.commons.util.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@ServerEndpoint(value = "/space/{spaceID}", encoders = {
        LoginAnswerEncoder.class,
        NewUserAnswerEncoder.class,
        PositionAnswerEncoder.class,
        LeaveAnswerEncoder.class,
        SignalAnswerEncoder.class,
        MediaAnswerEncoder.class,
        MessageEncoder.class,
        KickAnswerEncoder.class,
        ReconnectionEncoder.class
})
public class WsServerEndpoint {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    Gson gson = new GsonBuilder().create();
    private final LoginHandler loginHandler = new LoginHandler();
    private final PositionChangeHandler positionChangeHandler = new PositionChangeHandler();
    private final LeaveHandler leaveHandler = new LeaveHandler();
    private final SignalHandler signalHandler = new SignalHandler();
    private final MediaHandler mediaHandler = new MediaHandler();
    private final MessageHandler messageHandler = new MessageHandler();
    private final KickHandler kickHandler = new KickHandler();
    private final ReconnectionHandler reconnectionHandler = new ReconnectionHandler();

    private final PingHandler pingHandler = PingHandler.getInstance();


    // Have a look at the ConcurrentHashMap here:
    // https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html
    // https://www.baeldung.com/java-concurrent-map
    // Keep in mind the load factor and the concurrency level
    // Concurrent Hashmap probably works good for a Space, it is unclear whether it works good for the roomMap that stores
    // all Spaces.
    private final SpaceUserService spaceUserService = new SpaceUserService();

    @OnOpen
    public void openOpen(@PathParam("spaceID") String spaceID, Session session) {
        // increase the idle timeout time otherwise the user will be disconnected after a minute
        // set to 10 hours
        session.setMaxIdleTimeout(1000 * 60 * 60);


        // Get the room form the roomMap
        Map<String, User> room = spaceUserService.get(spaceID);
        // Check if the room exist if not create a new set for it
        if (room == null) {
            // create new Map for room
            room = new ConcurrentHashMap(8);
            spaceUserService.put(spaceID, room);
            log.info("Room {} newly opened", spaceID);
        }
        log.info("User joined the room {}", spaceID);

        // we expect the user to send a ping every 5 seconds
        pingHandler.initPing(session);
    }

    @OnMessage(maxMessageSize = -1L)
    public void openMessage(@PathParam("spaceID") String spaceID, Session session, String message) {
        // get data which the user send
        JsonObject jsonObject = JsonParser.parseString(message).getAsJsonObject();

        // Get room that was created when the user entered the space
        Map<String, User> room = spaceUserService.get(spaceID);

        // check if the user send a type (it probably does not make sense to check this here. Just let it fail.
        if (jsonObject.get("type") == null) {
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
            loginHandler.handleLogin(room, spaceID, token, userId, session);
        }

        if (type.equals("ping")) {
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
                    positionChangeHandler.handlePositinChange(spaceUserService.get(spaceID), spaceID, session, position);
                    break;
                case "signal":
                    content = jsonObject.getAsJsonObject("content");
                    targetId = jsonObject.get("target_id").getAsString();
                    signalHandler.handleSignal(spaceUserService.get(spaceID), spaceID, sender, content, targetId);
                    log.info("User {} signaled to user {} in room {}", sender.getId(), targetId, spaceID);
                    break;
                case "message":
                    userMessage = jsonObject.get("content").getAsString();
                    targetId = jsonObject.get("target_id").getAsString();
                    messageHandler.handleMessage(spaceUserService.get(spaceID), spaceID, sender, userMessage, targetId);
                    log.info("User {} send message to user {} in room {}", sender.getId(), targetId, spaceID);
                    break;
                case "leave":
                    leaveHandler.handleLeave(spaceID, spaceUserService.get(spaceID), sender);
                    log.info("User {} has left the room {}", sender.getId(), spaceID);
                    break;
                case "media":
                    String media = jsonObject.get("media").getAsString();
                    Boolean event = jsonObject.get("event").getAsBoolean();
                    Boolean changeToVideo = null;
                    if (jsonObject.get("changeToVideo") != null) {
                        changeToVideo = jsonObject.get("changeToVideo").getAsBoolean();
                    }
                    mediaHandler.handleMedia(spaceUserService.get(spaceID), sender, media, event, changeToVideo);
                    log.info("User {} changed his media type for {} to {}", sender.getId(), media, event);
                    break;
                case "kick":
                    if (!room.containsKey(session.getId())) {
                        log.warn("User tried to kick another user while not being in a room");
                        return;
                    }
                    sender = room.get(session.getId());
                    token = jsonObject.get("token").getAsString();
                    userId = jsonObject.get("user_id").getAsString();
                    kickHandler.handleKick(room, spaceID, sender, token, userId);
                    log.info("User {} was kicked by {} out of Space {}", userId, sender.getId(), spaceID);
                    break;
                case "reconnection":
                    if (!room.containsKey(session.getId())) {
                        log.warn("User tried to reconnect to another user while not being in a room");
                        return;
                    }
                    sender = room.get(session.getId());
                    userId = jsonObject.get("user_id").getAsString();
                    reconnectionHandler.handleReconnection(spaceUserService.get(spaceID), sender, userId);
                    log.info("Reconnection between {} and {} was handled", sender.getId(), userId);
                    break;
                default:
                    log.warn("The {} type is not defined", type);
            }
        }
    }

    @OnClose
    public void onClose(@PathParam("spaceID") String spaceID, Session session) {
        User sender = null;
        try {
            sender = spaceUserService.get(spaceID).get(session.getId());
        } catch (NullPointerException e) {
            log.error("Room {} does not exist but user closed connection on that room", spaceID);
        }
        pingHandler.handleLeave(session.getId());
        if (sender != null) {
            leaveHandler.handleLeave(spaceID, spaceUserService.get(spaceID), sender);
            log.info("User {} has left the room {}", sender.getId(), spaceID);
        }
    }

    @OnError
    public void onError(@PathParam("spaceID") String spaceID, Session session, Throwable t) {
        log.error(ExceptionUtils.readStackTrace(t));
        try {
            // This should call the onClose method where the user is then removed from the room
            session.close();
        } catch (IOException ioException) {
            log.info("Error was handled with cascading IOException");
            ioException.printStackTrace();
        } finally {
            log.info("Session error was handled");
        }
    }
}
