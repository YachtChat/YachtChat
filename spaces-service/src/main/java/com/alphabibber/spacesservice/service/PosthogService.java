package com.alphabibber.spacesservice.service;


import com.posthog.java.PostHog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class PosthogService {
    private static final String POSTHOG_API_KEY = "phc_8McKDIRFPbkreZyJSh8A4MtoL4dUHaB7eICFmoPFKsC";
    private static final String POSTHOG_HOST = "https://posthog.yacht.chat";
    private static final PostHog posthog = new PostHog.Builder(POSTHOG_API_KEY).host(POSTHOG_HOST).build();

    @Autowired
    public  PosthogService(){
    }

    public static void sendEvent(String id, String eventName, Map<String, Object> eventProperties){
        posthog.capture(id, eventName, eventProperties);
    }
}
