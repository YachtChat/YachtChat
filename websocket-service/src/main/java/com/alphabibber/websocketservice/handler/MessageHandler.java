package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.WsServerEndpoint;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.MessageAnswer;
import com.alphabibber.websocketservice.model.answer.SignalAnswer;
import com.alphabibber.websocketservice.service.SpaceUserService;
import com.google.gson.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import java.io.IOException;
import java.util.Map;

public class MessageHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final SpaceUserService spaceUserService = new SpaceUserService();

    public void handleMessage(String spaceId, User sender, String content, String target_id) {
        // get User via the target id
        User target = spaceUserService.getUserWithUserId(spaceId, target_id);

        MessageAnswer answer = new MessageAnswer(content, sender.getId());
        try {
            WsServerEndpoint.sendToOne(target, answer);
        }catch (IOException | EncodeException e) {
            log.error("Could not send message from {} to {}", sender.getId(), target.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }
        log.info("{}: User send message to user {} in room {}", sender.getId(), target.getId(), spaceId);
    }
}