package com.alphabibber.websocketservice.encoder;

import com.alphabibber.websocketservice.model.answer.KickAnswer;
import com.alphabibber.websocketservice.model.answer.RangeAnswer;
import com.google.gson.Gson;

import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class RangeAnswerEncoder implements Encoder.Text<RangeAnswer> {
    Gson gson = new Gson();
    @Override
    public String encode(RangeAnswer rangeAnswer) {
        return gson.toJson(rangeAnswer);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {

    }

    @Override
    public void destroy() {

    }
}
