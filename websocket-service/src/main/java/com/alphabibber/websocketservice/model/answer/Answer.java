package com.alphabibber.websocketservice.model.answer;

import com.google.gson.annotations.Expose;
import lombok.Getter;
import lombok.Setter;

public abstract class Answer {
    public Answer(String type){
        this.type = type;
    }
    @Getter @Setter @Expose
    private String type;
}
