package com.alphabibber.websocketservice.model;

import com.google.gson.annotations.Expose;
import lombok.Getter;
import lombok.Setter;

import javax.websocket.Session;

public class User {
    public User(Session session, String id){
        this.session = session;
        this.position = new Position(0, 0, 20);
        this.id = id;
    }
    @Getter @Setter @Expose(serialize = false)
    private Session session;
    @Getter @Setter @Expose private String id;
    @Getter @Setter @Expose  private Position position;
}
