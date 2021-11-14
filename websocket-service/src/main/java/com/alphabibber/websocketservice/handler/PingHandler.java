package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.LeaveAnswer;

import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class PingHandler {
    private final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(1);
    private final LeaveHandler leaveHandler = new LeaveHandler();

    // map[userId] = true when the client sends his ping
    Map<String, Boolean> pingMap = new HashMap<>();

    public void handlePing(String sessionId){
        pingMap.put(sessionId, true);
        return;
    }

    public void initPing(String sessionId, User user, Map<String, User> room) {
        executorService.scheduleAtFixedRate(() -> {
                    if(!pingMap.containsKey(sessionId) || !pingMap.get(sessionId)) {
                        leaveHandler.handleLeave(room, user);
                        executorService.shutdown();
                    } else {
                        pingMap.put(sessionId, false);
                    }
                },
                11, 11, TimeUnit.SECONDS);
    }
}
