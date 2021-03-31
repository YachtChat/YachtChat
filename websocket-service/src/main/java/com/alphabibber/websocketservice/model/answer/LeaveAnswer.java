package com.alphabibber.websocketservice.model.answer;

public class LeaveAnswer extends Answer{
    String id;
    public LeaveAnswer(String id){
        super("leave");
        this.id = id;
    }
}
