package com.alphabibber.websocketservice.model;

import com.alphabibber.websocketservice.model.message.Message;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.HashMap;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@ServerEndpoint(value = "/{room}/{username}")
public class Endpoints {

    private Session session;
    private static Set<Endpoints> endpoints = new CopyOnWriteArraySet<>();
    private static HashMap<String, String> users = new HashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("room") String room,
                       @PathParam("username") String user) throws IOException {
        // Take the incoming session and map it to the Endpoint object
        this.session = session;

        endpoints.add(this);
        users.put(session.getId(), user);
    }

    @OnMessage
    public static void onMessage(Session session, Message message) throws IOException{

    }

    @OnClose
    public void onClose(Session session) throws IOException {
        // WebSocket connection closes
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        // Do error handling here
    }
}
