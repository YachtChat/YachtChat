package com.alphabibber.websocketservice.encoder;

import com.alphabibber.websocketservice.model.answer.DNDAnswer;
import com.google.gson.Gson;

import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class DNDAnswerEncoder implements Encoder.Text<DNDAnswer> {
    Gson gson = new Gson();
    @Override
    public String encode(DNDAnswer answer) {
        return gson.toJson(answer);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {

    }

    @Override
    public void destroy() {

    }
}
