package com.alphabibber.websocketservice.model.answer;

import com.google.gson.annotations.Expose;

public class KickAnswer extends Answer{
    @Expose
    String id;

    public KickAnswer(String id){
        super("kick");
        this.id = id;
    }
}
