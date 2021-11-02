package com.alphabibber.websocketservice.model.answer;

import com.alphabibber.websocketservice.model.Position;

public class ReconnectionAnswer extends Answer{
    private String id;
    private Position position;
    private boolean is_caller;

    public ReconnectionAnswer(String id, Position position, boolean is_caller){
        super("reconnection");
        this.id = id;
        this.position = position;
        this.is_caller = is_caller;
    }
}
