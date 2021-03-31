package com.alphabibber.websocketservice.encoder;

import com.alphabibber.websocketservice.model.answer.SignalAnswer;
import com.google.gson.Gson;

import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class SignalAnswerEncoder implements Encoder.Text<SignalAnswer> {
    Gson gson = new Gson();

    @Override
    public String encode(SignalAnswer signalAnswer) {
        return gson.toJson(signalAnswer);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {

    }

    @Override
    public void destroy() {

    }
}
