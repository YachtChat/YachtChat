package com.alphabibber.websocketservice.model.answer;

import com.alphabibber.websocketservice.model.Position;

public class ReconnectionAnswer extends Answer{
    private String id;
    private Position position;
    private boolean isCaller;
    private boolean video;

    public ReconnectionAnswer(String id, Position position, boolean isCaller, boolean video){
        super("reconnection");
        this.id = id;
        this.position = position;
        this.isCaller = isCaller;
        this.video = video;
    }
}
