package com.alphabibber.websocketservice.encoder;

import com.alphabibber.websocketservice.model.answer.KickAnswer;
import com.alphabibber.websocketservice.model.answer.LeaveAnswer;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class KickAnswerEncoder implements Encoder.Text<KickAnswer>{
    Gson gson = new Gson();
    @Override
    public String encode(KickAnswer kickAnswer) {
        return gson.toJson(kickAnswer);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {

    }

    @Override
    public void destroy() {

    }
}
