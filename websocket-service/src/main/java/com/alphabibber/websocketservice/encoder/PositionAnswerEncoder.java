package com.alphabibber.websocketservice.encoder;

import com.alphabibber.websocketservice.model.answer.PositionAnswer;
import com.google.gson.Gson;

import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class PositionAnswerEncoder implements Encoder.Text<PositionAnswer> {
    Gson gson = new Gson();
    @Override
    public String encode(PositionAnswer positionAnswer) {
        return gson.toJson(positionAnswer);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {

    }

    @Override
    public void destroy() {

    }
}
