package com.alphabibber.websocketservice.model.answer;

import com.alphabibber.websocketservice.model.User;
import com.google.gson.annotations.Expose;

public class DNDAnswer extends Answer{
    @Expose
    String id;

    @Expose
    boolean event;

    public DNDAnswer(String id, boolean event) {
        super("doNotDisturb");
        this.id = id;
        this.event = event;
    }
}
