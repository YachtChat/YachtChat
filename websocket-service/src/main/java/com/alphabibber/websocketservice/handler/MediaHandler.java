package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.MediaAnswer;
import com.alphabibber.websocketservice.service.PosthogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;

public class MediaHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final PosthogService posthogService = PosthogService.getInstance();

    public static final String VIDEO = "video";
    public static final String AUDIO = "audio";
    public static final String SCREEN = "screen";

    public void handleMedia(Map<String, User> room, User sender, String media, Boolean event) {
        // the state did not really change
        if (sender.getMedia(media) == event) return;

        sender.setMedia(media, event);
        posthogService.trackMedia(sender.getId(), media, event);

        ArrayList<User> users = new ArrayList<>(room.values());
        MediaAnswer answer = new MediaAnswer(sender.getId(), media, sender.getMedia(media));

        users.forEach(user -> {
            if (user.getId().equals(sender.getId())) {
                return;
            }
            synchronized (user) {
                try {
                    user.getSession().getBasicRemote().sendObject(answer);
                } catch (EncodeException | IOException e) {
                    log.error("Could not send media {} with event {} to user {}.", media, event, user.getId());
                }
            }
        });
    }
}
