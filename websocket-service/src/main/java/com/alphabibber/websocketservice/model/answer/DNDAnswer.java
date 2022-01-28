package com.alphabibber.websocketservice.model.answer;

import com.alphabibber.websocketservice.model.User;
import com.google.gson.annotations.Expose;

public class DNDAnswer extends Answer{
    @Expose
    String id;

    @Expose
    User user;


    public DNDAnswer(String id, User user) {
        super("doNotDisturb");
        this.id = id;
        this.user = user;
    }
}
