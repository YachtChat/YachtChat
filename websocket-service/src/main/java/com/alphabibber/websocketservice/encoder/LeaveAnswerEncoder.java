package com.alphabibber.websocketservice.encoder;

import com.alphabibber.websocketservice.model.answer.LeaveAnswer;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class LeaveAnswerEncoder implements Encoder.Text<LeaveAnswer>{
    Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
    @Override
    public String encode(LeaveAnswer leaveAnswer) {
        return gson.toJson(leaveAnswer);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {

    }

    @Override
    public void destroy() {

    }
}
