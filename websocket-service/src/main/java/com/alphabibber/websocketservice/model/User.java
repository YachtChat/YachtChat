package com.alphabibber.websocketservice.model;

import com.google.gson.annotations.Expose;
import lombok.Getter;
import lombok.Setter;

import javax.websocket.Session;

public class User {
    public User(Session session, String id){
        this.session = session;
        this.position = new Position(0, 0, 20);
        this.video = true;
        this.audio = true;
        this.screen = false;
        this.id = id;
    }
    @Getter @Setter @Expose(serialize = false)
    private Session session;
    @Getter @Setter @Expose private String id;
    @Getter
    @Setter
    @Expose
    private Position position;
    @Getter
    @Setter
    @Expose
    private Boolean video;
    @Getter
    @Setter
    @Expose
    private Boolean audio;
    @Getter
    @Setter
    @Expose
    private Boolean screen;
}
