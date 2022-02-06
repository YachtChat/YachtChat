package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.LeaveAnswer;
import com.alphabibber.websocketservice.service.SpaceUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.Session;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.*;

public class PingHandler {
    private final LeaveHandler leaveHandler = new LeaveHandler();
    private final SpaceUserService spaceUserService = new SpaceUserService();

    private final Logger log = LoggerFactory.getLogger(this.getClass());

    // map[userId] = true when the client sends his ping
    private final static Map<String, Boolean> pingMap = new HashMap<>();

    // map storing all the timer for all user
    private final static Map<String, Timer> timerMap = new HashMap<>();

    public void handlePing(String sessionId){
        pingMap.put(sessionId, true);
        return;
    }

    public void handleLeave(String sessionId) {
        if (timerMap.containsKey(sessionId)) {
            timerMap.get(sessionId).cancel();
            timerMap.remove(sessionId);
        }
        if(pingMap.containsKey(sessionId)) {
            pingMap.remove(sessionId);
        }
    }

    public void initPing(Session session, String spaceId) {
        Timer timer = new Timer();
        // Task that should be scheduled to run every n seconds
        TimerTask task = new TimerTask(){
            public void run() {
                log.debug("Ping check was started");
                if (!pingMap.containsKey(session.getId()) || !pingMap.get(session.getId())) {
                    if(spaceUserService.getUser(spaceId, session.getId()) != null) {
                        User sender = spaceUserService.getUser(spaceId, session.getId());
                        leaveHandler.handleLeave(spaceId, sender);
                    }
                    // delete the timer for the user
                    handleLeave(session.getId());
                    try {
                        // check if the user is still in the space
                        session.close();
                    }catch(IOException e) {
                        log.error("Error closing session");
                    }
                } else{
                    pingMap.put(session.getId(), false);
                }
            }
        };
        timer.scheduleAtFixedRate(task, 5 * 1000, 10 * 1000);
        timerMap.put(session.getId(), timer);
    }
}
