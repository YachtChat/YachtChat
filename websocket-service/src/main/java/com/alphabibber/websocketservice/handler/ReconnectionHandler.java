package com.alphabibber.websocketservice.handler;

import java.io.IOException;
import java.util.Map;

import com.alphabibber.websocketservice.WsServerEndpoint;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.LeaveAnswer;
import com.alphabibber.websocketservice.model.answer.ReconnectionAnswer;
import com.alphabibber.websocketservice.service.SpaceUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;

public class ReconnectionHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final SpaceUserService spaceUserService = new SpaceUserService();

    /**
     * Handler tells sender that the target left and tells the target that the sender left.
     * then Handler tells sender that the target joined and tells the target that the sender joined
     * @param spaceId
     * @param sessionId: the previous caller
     * @param userId: id of the previous callee
     */
    public void handleReconnection(String spaceId, String sessionId, String userId) {
        User sender = spaceUserService.getUser(spaceId, sessionId);
        log.warn("Reconnection between {} and {} was triggered", sender.getId(), userId);

        User target = spaceUserService.getUserWithUserId(spaceId, userId);

        LeaveAnswer answerToSender = new LeaveAnswer(target.getId());
        LeaveAnswer answerToTarget = new LeaveAnswer(sender.getId());

        try {
            WsServerEndpoint.sendToOne(sender, answerToSender);
        } catch (EncodeException | IOException e) {
            log.error("Could not send reconnection answer to {}", sender.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }

        try {
            WsServerEndpoint.sendToOne(target, answerToTarget);
        } catch (EncodeException | IOException e) {
            log.error("Could not send reconnection answer to {}", target.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }

        try {
//            waiting here might not be necessary
            Thread.sleep(250);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }

        ReconnectionAnswer reconnectionAnswerToSender =
                new ReconnectionAnswer(target.getId(), target.getPosition(), sender.getMedia(MediaHandler.VIDEO),
                        sender.getMedia(MediaHandler.AUDIO), true);
        ReconnectionAnswer reconnectionAnswerToTarget = new ReconnectionAnswer(sender.getId(), sender.getPosition(),
                target.getMedia(MediaHandler.VIDEO), target.getMedia(MediaHandler.AUDIO), false);

        try {
            WsServerEndpoint.sendToOne(sender, reconnectionAnswerToSender);
        } catch (EncodeException | IOException e) {
            log.error("Could not send reconnection answer to {}", sender.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }

        try {
            WsServerEndpoint.sendToOne(target, reconnectionAnswerToTarget);
        } catch (EncodeException | IOException e) {
            log.error("Could not send reconnection answer to {}", target.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }
    }

}
