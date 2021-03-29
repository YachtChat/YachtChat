package com.alphabibber.websocketservice.model.answer;

import com.alphabibber.websocketservice.model.Position;
import lombok.Getter;
import lombok.Setter;

public class PositionAnswer extends Answer{
    @Getter @Setter
    private Position position;
    @Getter @Setter
    private String id;

    public PositionAnswer(Position position, String id) {
        super("position");
        this.position = position;
        this.id = id;
    }
}
