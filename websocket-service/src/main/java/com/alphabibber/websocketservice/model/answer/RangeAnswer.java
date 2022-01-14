package com.alphabibber.websocketservice.model.answer;

import lombok.Getter;
import lombok.Setter;

public class RangeAnswer extends Answer{
    @Getter @Setter
    private String id;

    @Getter @Setter
    private boolean event;

    public RangeAnswer(String id, boolean event){
        super("range");
        this.id = id;
        this.event = event;
    }
}
