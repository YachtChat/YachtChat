package com.alphabibber.websocketservice.service;

import com.alphabibber.websocketservice.handler.MediaHandler;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.MediaAnswer;
import com.posthog.java.PostHog;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

public class PosthogService {
    private static final String POSTHOG_API_KEY = "phc_8McKDIRFPbkreZyJSh8A4MtoL4dUHaB7eICFmoPFKsC";
    private static final String POSTHOG_HOST = "https://posthog.yacht.chat";
    private static final PostHog posthog = new PostHog.Builder(POSTHOG_API_KEY).host(POSTHOG_HOST).build();
    private static PosthogService instance;

    private final String onString = "On";
    private final String offString = "Off";

    @Getter
    private static final String spaceJoinedString = "spaceJoined";
    @Getter
    private static final String spaceLeftString = "spaceLeft";
    @Getter
    private static final String spaceIdString = "spaceId";
    @Getter
    private static final String doNotDisturb = "doNotDisturb";
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
     * @param user: user object
     * @param spaceId: space id
     * @param room: room that represents space
     */
    public void handleLogin(User user, String spaceId, Map<String, User> room) {
        // tell posthog that the user logged into that space
        sendEvent(user.getId(), spaceJoinedString, new HashMap<String, Object>(){{put(spaceIdString, spaceId);}});
        // init camera to on
        for (Map.Entry<String, Boolean> set: user.getMedia().entrySet()){
            startTracking(user.getId(), set.getKey(), set.getValue());
        }
        // startTracking the DND
        startTracking(user.getId(), doNotDisturb, false);

        // track room size
        if (room.size() > 1) {
            for (User u : room.values()) {
                sendEvent(u.getId(), spaceWithOtherUserString, new HashMap<String, Object>() {{
                    put(roomSizeString, room.size());
                }});
            }
        }
    }

    public void handleLeave(User user, String spaceId){
        for (Map.Entry<String, Boolean> set: user.getMedia().entrySet()){
            stopTracking(user.getId(), set.getKey(), set.getValue());
        }
        // stop tracking the DND mode
        stopTracking(user.getId(), doNotDisturb, user.getDoNotDisturb());
        // tell posthog that the user logged out of that space
        sendEvent(user.getId(), spaceLeftString, new HashMap<String, Object>(){{put(spaceIdString, spaceId);}});
    }

    public void trackMedia(String id, String media, boolean on){
        startTracking(id, media, on);
        stopTracking(id, media, !on);
    }
}
