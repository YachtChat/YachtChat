package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.WsServerEndpoint;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.SignalAnswer;
import com.alphabibber.websocketservice.service.SpaceUserService;
import com.google.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.Session;
import java.io.IOException;
import java.util.Map;

public class SignalHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final SpaceUserService spaceUserService = new SpaceUserService();

    public void handleSignal(String spaceId, String sessionId, JsonObject content, String target_id){
        // get User via the target id
        User target = spaceUserService.getUserWithUserId(spaceId, target_id);

        try {
            WsServerEndpoint.sendToOne(target, new SignalAnswer(content, spaceUserService.getUser(spaceId, sessionId).getId()));
        } catch (IOException | EncodeException e) {
            log.error("Could not send signaling {}", target.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }

        log.info("User signaled to user {} in room {}", target_id, spaceId);
    }
}
