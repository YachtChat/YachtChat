package org.jboss.aerogear.keycloak.metrics;

import com.posthog.java.PostHog;
import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

public class PosthogService {
    private static final String POSTHOG_API_KEY = "phc_8McKDIRFPbkreZyJSh8A4MtoL4dUHaB7eICFmoPFKsC";
    private static final String POSTHOG_HOST = "https://posthog.yacht.chat";
    private static final PostHog posthog = new PostHog.Builder(POSTHOG_API_KEY).host(POSTHOG_HOST).build();
    private static PosthogService instance;

//    private final OkHttpClient httpClient = new OkHttpClient();

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
        posthog.capture(id, eventName);
    }
}
