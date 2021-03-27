package com.alphabibber.websocketservice.model;

import lombok.Getter;
import lombok.Setter;

public class Position {
    public Position(int x, int y, int range){
        this.x = x;
        this.y = y;
        this.range = range;
    }
    @Getter @Setter int x;
    @Getter @Setter int y;
    @Getter @Setter int range;
}
