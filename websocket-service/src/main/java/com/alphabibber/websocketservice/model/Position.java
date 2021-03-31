package com.alphabibber.websocketservice.model;

import com.google.gson.annotations.Expose;
import lombok.Getter;
import lombok.Setter;

public class Position {
    public Position(int x, int y, int range){
        this.x = x;
        this.y = y;
        this.range = range;
    }
    @Getter @Setter @Expose int x;
    @Getter @Setter @Expose int y;
    @Getter @Setter @Expose int range;
}
