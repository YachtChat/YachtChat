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
    private static String getISO8601StringForDate(Date date) {
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.GERMANY);
        dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
        return dateFormat.format(date);
    }


    
    
    public void sendEvent(String id, String eventName){
//        Date now = new Date();
//        RequestBody formBody = new FormBody.Builder()
//                .add("api_key", POSTHOG_API_KEY)
//                .add("event", eventName)
//                .add("distinct_id", id)
//                .add("timestamp", getISO8601StringForDate(now))
//                .build();
//        Request request = new Request.Builder()
//                .url(POSTHOG_HOST + "/capture/")
//                .addHeader("Content-Type", "application/json")
//                .post(formBody)
//                .build();
//        try {
//            httpClient.newCall(request).execute();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
    }
//    POST https://[your-instance].com/capture/
//    Content-Type: application/json
//    Body:
//    {
//        "api_key": "<ph_project_api_key>",
//            "event": "[event name]",
//            "properties": {
//        "distinct_id": "[your users' distinct id]",
//                "key1": "value1",
//                "key2": "value2"
//    },
//        "timestamp": "[optional timestamp in ISO 8601 format]"
//    }

}
