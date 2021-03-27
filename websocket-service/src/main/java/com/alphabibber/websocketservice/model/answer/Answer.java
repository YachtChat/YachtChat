package com.alphabibber.websocketservice.model.answer;

import lombok.Getter;
import lombok.Setter;

public abstract class Answer {
    public Answer(String type){
        this.type = type;
    }
    @Getter @Setter
    private String type;
}
