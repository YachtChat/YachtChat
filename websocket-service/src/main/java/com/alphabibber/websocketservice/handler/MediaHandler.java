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

    public void handleMedia(Map<String, User> room, User sender, String media, Boolean event, Boolean changeToVideo) {
        boolean prevVideoShared = (sender.getVideo() || sender.getScreen());
        boolean prevAudioShared = (sender.getAudio());
        switch (media) {
            case "video":
                // track the event if something has changed
                if (!(event == sender.getVideo())) posthogService.trackVideo(sender.getId(), event);
                sender.setVideo(event);
                break;
            case "audio":
                // track the event if something has changed
                if (!(event == sender.getAudio())) posthogService.trackAudio(sender.getId(), event);
                sender.setAudio(event);
                break;
            case "screen":
                // track the event if something has changed
                if (!(event == sender.getScreen())) {
                    posthogService.trackScreen(sender.getId(), event, sender.getVideo(), changeToVideo);
                }
                sender.setScreen(event);
                // set video to true if its an off event and the change back is to video else set to false
                sender.setVideo(!event && changeToVideo);
                break;

            default:
                log.error("The media " + media + " is not known.");
                return;
        }
        if (prevVideoShared != (sender.getVideo() || sender.getScreen()) || prevAudioShared != sender.getAudio()) {
            MediaAnswer answer;
            if (media.equals("audio"))
                answer = new MediaAnswer(sender.getId(), media, sender.getAudio());
            else
                answer = new MediaAnswer(sender.getId(), media, (sender.getScreen() || sender.getVideo()));

            ArrayList<User> users = new ArrayList<>(room.values());
            MediaAnswer finalAnswer = answer;
            users.forEach(user -> {
                if (user.getId().equals(sender.getId())) {
                    return;
                }
                synchronized (user) {
                    try {
                        user.getSession().getBasicRemote().sendObject(finalAnswer);
                    } catch (EncodeException | IOException e) {
                        log.error("Could not send media {} with event {} to user {}.", media, event, user.getId());
                    }
                }
            });
        }
    }
}
