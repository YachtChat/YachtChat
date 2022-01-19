package com.alphabibber.websocketservice.model;

import com.alphabibber.websocketservice.handler.MediaHandler;
import com.google.gson.annotations.Expose;
import lombok.Getter;
import lombok.Setter;

import javax.websocket.Session;
import java.util.HashMap;

public class User {
    public User(Session session, String id, boolean video, boolean audio){
        this.session = session;
        this.position = new Position(0, 0, 20);

        HashMap<String, Boolean> media = new HashMap<String, Boolean>();
        media.put(MediaHandler.VIDEO, video);
        media.put(MediaHandler.AUDIO, audio);
        media.put(MediaHandler.SCREEN, false);
        this.media = media;

        this.id = id;
    }
    @Getter @Setter @Expose(serialize = false)
    private Session session;
    @Getter @Setter @Expose private String id;
    @Getter
    @Setter
    @Expose
    private Position position;

    @Expose
    private HashMap<String, Boolean> media;

    public HashMap<String, Boolean> getMedia(){
        return this.media;
    }

    public Boolean getMedia(String type){
        return this.media.get(media);
    }
    public void setMedia(String type, Boolean on){
        this.media.put(type, on);
    }
}
