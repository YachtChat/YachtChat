package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.WsServerEndpoint;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.DNDAnswer;
import com.alphabibber.websocketservice.model.answer.MediaAnswer;
import com.alphabibber.websocketservice.service.PosthogService;
import com.alphabibber.websocketservice.service.SpaceUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;

public class MediaHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final PosthogService posthogService = PosthogService.getInstance();
    private final SpaceUserService spaceUserService = new SpaceUserService();

    public static final String VIDEO = "video";
    public static final String AUDIO = "audio";
    public static final String SCREEN = "screen";
    public static final String DND = "doNotDisturb";

    private void handleDND(String spaceId, String sessionId, Boolean event, String media){
        User user = spaceUserService.getUser(spaceId, sessionId);
        if (event == spaceUserService.getUser(spaceId, sessionId).getDoNotDisturb()){
            log.error("{}: user set DND to {} but it was already set", user.getId(), event);
            return;
        }

        // update the state
        user.setDoNotDisturb(event);
        user = spaceUserService.putUserInSpace(spaceId, user, sessionId);

        DNDAnswer answer = new DNDAnswer(user.getId(), event);
        try {
            WsServerEndpoint.broadcast(spaceUserService.getUserSet(spaceId), answer, sessionId);
        } catch (EncodeException | IOException e) {
            log.error("{}: Could not send DND with event {}", user.getId(), event);
        }

        log.info("{}: User changed DND to {}", user.getId(), event);
        posthogService.trackMedia(user.getId(), media, event);
    }

    public void handleMedia(String spaceId, String sesssionId, String media, Boolean event) {
        if (media.equals(DND)){
            handleDND(spaceId, sesssionId, event, media);
            return;
        }

        User user = spaceUserService.getUser(spaceId, sesssionId);
        // the state did not really change
        if (user.getMedia(media) == event) return;

        user.setMedia(media, event);
        user = spaceUserService.putUserInSpace(spaceId, user, sesssionId);
        posthogService.trackMedia(user.getId(), media, event);

        MediaAnswer answer = new MediaAnswer(user.getId(), media, user.getMedia(media));
        try {
            WsServerEndpoint.broadcast(spaceUserService.getUserSet(spaceId), answer, sesssionId);
        } catch (EncodeException | IOException e) {
            log.error("Could not send media {} with event {} to user {}.", media, event, user.getId());
        }

        log.info("{}: User changed his media type for {} to {}", user.getId(), media, event);
    }
}
