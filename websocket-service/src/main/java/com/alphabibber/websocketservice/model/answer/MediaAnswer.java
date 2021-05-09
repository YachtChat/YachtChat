package com.alphabibber.websocketservice.model.answer;

import com.google.gson.annotations.Expose;
public class MediaAnswer extends Answer{
    @Expose
    String medium;
    @Expose
    Boolean event;
    @Expose
    String id;

    public MediaAnswer(String id, String medium, Boolean event){
        super("media");
        this.medium = medium;
        this.event = event;
        this.id = id;
    }
}
