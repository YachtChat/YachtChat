package com.alphabibber.websocketservice.model.answer;

import lombok.Getter;
import lombok.Setter;

public class NewUserAnswer {
    @Getter @Setter
    private String id;
    public NewUserAnswer(String id){
        this.id = id;
    }
}
