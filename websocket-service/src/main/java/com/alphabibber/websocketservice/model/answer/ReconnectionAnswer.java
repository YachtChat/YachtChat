package com.alphabibber.websocketservice.model.answer;

import com.alphabibber.websocketservice.model.Position;

public class ReconnectionAnswer extends Answer{
    private String id;
    private Position position;
    private boolean video;
    private boolean audio;
    private boolean isCaller;

    public ReconnectionAnswer(String id, Position position, boolean video, boolean audio, boolean isCaller){
        super("reconnection");
        this.id = id;
        this.position = position;
        this.video = video;
        this.audio = audio;
        this.isCaller = isCaller;
    }
}
