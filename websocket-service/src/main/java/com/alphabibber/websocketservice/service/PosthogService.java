package com.alphabibber.websocketservice.service;

import com.alphabibber.websocketservice.model.User;
import com.posthog.java.PostHog;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

public class PosthogService {
    private static final String POSTHOG_API_KEY = "phc_8McKDIRFPbkreZyJSh8A4MtoL4dUHaB7eICFmoPFKsC";
    private static final String POSTHOG_HOST = "https://posthog.yacht.chat";
    private static final PostHog posthog = new PostHog.Builder(POSTHOG_API_KEY).host(POSTHOG_HOST).build();
    private static PosthogService instance;

    private final String video = "video";
    private final String audio = "audio";
    private final String screen = "screen";
    private final String onString = "On";
    private final String offString = "Off";

    @Getter
    private static final String spaceJoinedString = "spaceJoined";
    @Getter
    private static final String spaceLeftString = "spaceLeft";
    @Getter
    private static final String spaceIdString = "spaceId";
    @Getter
    private static final String spaceWithOtherUserString = "spaceWithOtherUser";
    @Getter
    private static final String roomSizeString = "roomSize";

    private PosthogService(){

    }
    public static PosthogService getInstance(){
        if(instance == null){
            instance = new PosthogService();
        }
        return instance;
    }
    // send to posthog
    private void sendEvent(String id, String eventName, Map<String, Object> eventProperties){
        posthog.capture(id, eventName, eventProperties);
    }

    // stop what is currently being tracked
    private void stopTracking(String userId, String media, boolean on){
        sendEvent(userId, media + (on ? onString : offString) + offString, null);
    }
    private void startTracking(String userId, String media, boolean on){
        sendEvent(userId, media + (on ? onString : offString) + onString, null);
    }

    /**
     * Send all necessay events to posthog when user loggs into space
     * @param id: user id
     * @param spaceId: space id
     * @param room: room that represents space
     */
    public void handleLogin(String id, String spaceId, Map<String, User> room) {
        // tell posthog that the user logged into that space
        sendEvent(id, spaceJoinedString, new HashMap<String, Object>(){{put(spaceIdString, spaceId);}});
        // init camera to on
        startTracking(id, video, true);
        startTracking(id, audio, true);

        // track room size
        if (room.size() == 1) {
            for (User u : room.values()) {
                sendEvent(u.getId(), spaceWithOtherUserString, new HashMap<String, Object>() {{
                    put(roomSizeString, room.size());
                }});
            }
        }
    }

    public void handleLeave(User user, String spaceId){
        stopTracking(user.getId(), video, user.getVideo());
        stopTracking(user.getId(), audio, user.getAudio());
        if(user.getScreen()){
            sendEvent(user.getId(), screen + offString, null);
        }
        // tell posthog that the user logged out of that space
        sendEvent(user.getId(), spaceLeftString, new HashMap<String, Object>(){{put(spaceIdString, spaceId);}});
    }

    public void trackVideo(String id, boolean on){
        // start tracking what is turned on (ends with on)
        startTracking(id, video, on);
        // stop tracking what is turned off (ends with off)
        stopTracking(id, video, !on);
    }

    public void trackAudio(String id, boolean on){
        // start tracking what is turned on (ends with on)
        startTracking(id, audio, on);
        // stop tracking what is turned off (ends with off)
        stopTracking(id, audio, !on);
    }

    public void trackScreen(String id, boolean on, boolean videoOn, Boolean changeToVideo) {
        if(on){
            // if screen was activated if is now off
            if(videoOn) trackVideo(id, false);
            sendEvent(id, screen + onString, null);
        } else{
            if(changeToVideo) trackVideo(id, true);
            sendEvent(id, screen + offString, null);
        }
    }
}
