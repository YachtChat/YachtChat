package org.jboss.aerogear.keycloak.metrics;

import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.admin.AdminEvent;
import java.util.HashMap;

public class MetricsEventListener implements EventListenerProvider {

    public final static String ID = "posthog-metrics-listener";

    private final static PosthogService posthogService = PosthogService.getInstance();

    @Override
    public void onEvent(Event event) {
        identifyUserIfPossible(event);
        switch (event.getType()) {
            case REGISTER:
                posthogService.sendEvent(event.getUserId(), "register", getHasMapOfEventDetails(event));
                break;
            case LOGIN:
                posthogService.sendEvent(event.getUserId(), "login", getHasMapOfEventDetails(event));
                break;
            case LOGOUT:
                posthogService.sendEvent(event.getUserId(), "logout", null);
                break;
            case SEND_VERIFY_EMAIL:
                posthogService.sendEvent(event.getUserId(), "send_verify_email", null);
                break;
            case VERIFY_EMAIL:
                posthogService.sendEvent(event.getUserId(), "verify_email", null);
                break;
        }
    }

    @Override
    public void onEvent(AdminEvent event, boolean includeRepresentation) {
        // unused
    }

    private void identifyUserIfPossible(Event event) {
        posthogService.identify(event.getUserId());
        if (event.getDetails() != null) {
            if (event.getDetails().containsKey("email")){
                posthogService.alis(event.getDetails().get("email"), event.getUserId());
            }
        }
    }

    private HashMap<String, Object> getHasMapOfEventDetails (Event event) {
        HashMap<String, Object> res = new HashMap<>();
        if (event.getDetails() != null) {
             if (event.getDetails().containsKey("identity_provider")){
                 res.put("identity_provider", event.getDetails().get("identity_provider"));
             } else{
                 res.put("identity_provider", "email");
             }
         }
        return res;
    }

    @Override
    public void close() {
        // unused
    }
}
