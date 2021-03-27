package com.alphabibber.websocketservice.model;

import com.google.gson.annotations.Expose;
import lombok.Getter;
import lombok.Setter;

import javax.websocket.Session;

public class User {
    public User(Session session){
        this.session = session;
        this.position = new Position(100, 100, 3);
    }
    @Getter @Setter @Expose(serialize = false)
    private Session session;
    @Getter @Setter private String id;
    @Getter @Setter private Position position;
}
