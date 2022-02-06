package com.alphabibber.websocketservice;

import com.alphabibber.websocketservice.encoder.*;
import com.alphabibber.websocketservice.handler.MessageHandler;
import com.alphabibber.websocketservice.handler.*;
import com.alphabibber.websocketservice.model.Position;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.Answer;
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
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
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
        ReconnectionEncoder.class,
        RangeAnswerEncoder.class,
        DNDAnswerEncoder.class
})
public class WsServerEndpoint {
    private static final Logger log = LoggerFactory.getLogger(WsServerEndpoint.class);
    Gson gson = new GsonBuilder().create();
    private final LoginHandler loginHandler = new LoginHandler();
    private final PositionChangeHandler positionChangeHandler = new PositionChangeHandler();
    private final LeaveHandler leaveHandler = new LeaveHandler();
    private final SignalHandler signalHandler = new SignalHandler();
    private final MediaHandler mediaHandler = new MediaHandler();
    private final MessageHandler messageHandler = new MessageHandler();
    private final KickHandler kickHandler = new KickHandler();
    private final ReconnectionHandler reconnectionHandler = new ReconnectionHandler();
    private final RangeHandler rangeHandler = new RangeHandler();

    private final PingHandler pingHandler = new PingHandler();


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
        log.info("User joined the space: {}", spaceID);

        // we expect the user to send a ping every 5 seconds
        pingHandler.initPing(session, spaceID);
    }

    @OnMessage(maxMessageSize = -1L)
    public void openMessage(@PathParam("spaceID") String spaceID, Session session, String message) {
        // get data which the user send
        JsonObject jsonObject = JsonParser.parseString(message).getAsJsonObject();

        // check if the user send a type (it probably does not make sense to check this here. Just let it fail.
        if (jsonObject.get("type") == null) {
            throw new IllegalArgumentException("Field 'type' should be provided");
        }
        String type = jsonObject.get("type").getAsString();

        // if the user is not yet part of the room the type has to be 'login'
        if (!spaceUserService.isUserPartOfSpace(spaceID, session.getId())) {
            if (!type.equals("login")) {
                log.error("New user tried to send a message with type: {} without being logged in for space {}", type, spaceID);
            }
            String token = jsonObject.get("token").getAsString();
            String userId = jsonObject.get("id").getAsString();
            boolean video = jsonObject.get("video").getAsBoolean();
            boolean microphone = jsonObject.get("microphone").getAsBoolean();
            loginHandler.handleLogin(spaceID, token, userId, session, video, microphone);
            return;
        }

        if (type.equals("ping")) {
            pingHandler.handlePing(session.getId());
        }


        // if the user is already logged in the space, it can be various type
        else {
            // get the sender as a User object
            User sender = spaceUserService.getUser(spaceID, session.getId());
//            User sender = room.get(session.getId());
//            String token;
//            String userId;

            JsonObject content;
            String targetId;
            String userMessage;
            boolean event;
            switch (type) {
                case "range":
                    event = jsonObject.get("event").getAsBoolean();
                    String target_id = jsonObject.get("target_id").getAsString();
                    rangeHandler.handleRange(spaceUserService.get(spaceID), session.getId(), event, target_id);
                    break;
                case "position":
                    JsonObject positionStr = jsonObject.get("position").getAsJsonObject();
                    Position position = gson.fromJson(positionStr, Position.class);
                    positionChangeHandler.handlePositinChange(spaceID, session.getId(), position);
                    break;
                case "signal":
                    content = jsonObject.getAsJsonObject("content");
                    targetId = jsonObject.get("target_id").getAsString();
                    signalHandler.handleSignal(spaceID, session.getId(), content, targetId);
                    break;
                case "message":
                    userMessage = jsonObject.get("content").getAsString();
                    targetId = jsonObject.get("target_id").getAsString();
                    messageHandler.handleMessage(spaceID, spaceUserService.getUser(spaceID, session.getId()), userMessage, targetId);
                    break;
                case "leave":
                    leaveHandler.handleLeave(spaceID, sender);
                    break;
                case "media":
                    String media = jsonObject.get("media").getAsString();
                    event = jsonObject.get("event").getAsBoolean();
                    mediaHandler.handleMedia(spaceID, session.getId(), media, event);
                    break;
                case "kick":
                    String token = jsonObject.get("token").getAsString();
                    String userId = jsonObject.get("user_id").getAsString();
                    kickHandler.handleKick(spaceID, session.getId(), token, userId);
                    break;
                case "reconnection":
                    userId = jsonObject.get("user_id").getAsString();
                    reconnectionHandler.handleReconnection(spaceID, session.getId(), userId);
                    break;
                default:
                    log.warn("The {} type is not defined", type);
            }
        }
    }

    @OnClose
    public void onClose(@PathParam("spaceID") String spaceID, Session session) {
        User sender = null;
        if (spaceUserService.getUser(spaceID, session.getId()) != null) {
            sender = spaceUserService.get(spaceID).get(session.getId());
            leaveHandler.handleLeave(spaceID, sender);
        }
    }

    @OnError
    public void onError(@PathParam("spaceID") String spaceID, Session session, Throwable t) {
        try{
            User sender = spaceUserService.get(spaceID).get(session.getId());
            log.error("{}: Error occured in the space {}", sender.getId(), spaceID, t);
        }catch (NullPointerException e){
            log.error("Error for user that is not longer part of space {}", spaceID, t);
        }finally {
            try{
                session.close();
            }catch (IOException ioException) {
                log.info("Error was handled with cascading IOException");
            }
        }
    }

    /**
     * This method is used to send a message to a specific user
     * @param target: User to send the message to
     * @param answer: Message to send
     */
    public static void sendToOne(User target, Answer answer) throws EncodeException, IOException {
        Session session = target.getSession();

        synchronized (session) {
            session.getBasicRemote().sendObject(answer);
        }
    }

    /**
     * This method is used to send a message to all users in a room with the exception of the sender
     * @param users: Users in the room
     * @param answer: Message to send
     * @param userId: User that sent the message
     */
    public static void broadcast(Collection<User> users, Answer answer, String userId) throws EncodeException, IOException {
        for (User user : users) {
            if (!user.getId().equals(userId)) {
                sendToOne(user, answer);
            }
        }
    }
}
