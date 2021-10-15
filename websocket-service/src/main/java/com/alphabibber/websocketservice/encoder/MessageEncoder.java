package com.alphabibber.websocketservice.encoder;

import com.alphabibber.websocketservice.model.answer.MessageAnswer;
import com.google.gson.Gson;

import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class MessageEncoder implements Encoder.Text<MessageAnswer> {
    Gson gson = new Gson();

    @Override
    public String encode(MessageAnswer messageAnswer) {
        return gson.toJson(messageAnswer);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {
    }

    @Override
    public void destroy() {

    }
}
