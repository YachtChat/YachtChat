package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.LeaveAnswer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.Session;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.*;

public class PingHandler {
    private static PingHandler instance;
    private final ScheduledThreadPoolExecutor scheduledThreadPoolExecutor = (ScheduledThreadPoolExecutor) Executors.newScheduledThreadPool(5);
    private final LeaveHandler leaveHandler = new LeaveHandler();

    private final Logger log = LoggerFactory.getLogger(this.getClass());

    // map[userId] = true when the client sends his ping
    private Map<String, Boolean> pingMap = new HashMap<>();

    // map storing all the timer for all user
    private Map<String, ScheduledFuture<?>> timerMap = new HashMap<>();

    private PingHandler(){}
    public static PingHandler getInstance() {
        if(instance == null) {
            instance = new PingHandler();
            // after we call .cancel on the timer we want to fully remove the timer.
            instance.scheduledThreadPoolExecutor.setRemoveOnCancelPolicy(true);
        }
        return instance;
    }

    public void handlePing(String sessionId){
        pingMap.put(sessionId, true);
        return;
    }

    public void handleLeave(String sessionId) {
        if (timerMap.containsKey(sessionId)) {
            timerMap.get(sessionId).cancel(false);
            timerMap.remove(sessionId);
        }
        if(pingMap.containsKey(sessionId)) {
            pingMap.remove(sessionId);
        }
    }

    public void initPing(Session session) {
        timerMap.put(session.getId(),
                scheduledThreadPoolExecutor.scheduleAtFixedRate(() -> {
                    if(!pingMap.containsKey(session.getId()) || !pingMap.get(session.getId())) {
                        try {
                            session.close();
                        } catch (IOException e) {
                            log.error("Session could not be closed in PingHandler");
                        }
                    }
                    else{
                        pingMap.put(session.getId(), false);
                    }
                },
                11, 11, TimeUnit.SECONDS)
        );
    }
}
