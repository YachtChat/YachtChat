package com.alphabibber.websocketservice.model.answer;

import com.google.gson.annotations.Expose;

public class LeaveAnswer extends Answer{
    @Expose
    String id;
    public LeaveAnswer(String id){
        super("leave");
        this.id = id;
    }
}
