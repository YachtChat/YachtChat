package com.alphabibber.websocketservice.encoder;

import com.alphabibber.websocketservice.model.answer.LoginAnswer;
import com.alphabibber.websocketservice.model.answer.ReconnectionAnswer;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class ReconnectionEncoder implements Encoder.Text<ReconnectionAnswer> {
    // tell gson to just use field for serialization that are annotated
    Gson gson = new GsonBuilder().create();

    @Override
    public String encode(ReconnectionAnswer reconnectionAnswer) throws EncodeException {
        return gson.toJson(reconnectionAnswer);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {
    }

    @Override
    public void destroy() {
    }
}
