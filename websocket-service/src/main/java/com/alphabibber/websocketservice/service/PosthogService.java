package com.alphabibber.websocketservice.service;

import com.posthog.java.PostHog;
import net.minidev.json.JSONObject;

import javax.lang.model.util.Types;
import java.util.HashMap;
import java.util.Map;

public class PosthogService {
    private static final String POSTHOG_API_KEY = "phc_8McKDIRFPbkreZyJSh8A4MtoL4dUHaB7eICFmoPFKsC";
    private static final String POSTHOG_HOST = "https://posthog.yacht.chat";
    private static final PostHog posthog = new PostHog.Builder(POSTHOG_API_KEY).host(POSTHOG_HOST).build();
    private static PosthogService instance;

    private PosthogService(){

    }
    public static PosthogService getInstance(){
        if(instance == null){
            instance = new PosthogService();
        }
        return instance;
    }

    public void sendEvent(String id, String eventName, Map<String, Object> eventProperties){
        posthog.capture(id, eventName, eventProperties);
//        posthog.capture(id, eventName);
    }
}
