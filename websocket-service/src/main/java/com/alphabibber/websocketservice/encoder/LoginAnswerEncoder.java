package com.alphabibber.websocketservice.encoder;

import com.alphabibber.websocketservice.model.answer.LoginAnswer;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class LoginAnswerEncoder implements Encoder.Text<LoginAnswer> {
    // tell gson to just use field for serialization that are annotated
    Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
    @Override
    public String encode(LoginAnswer loginAnswer) throws EncodeException {
        return gson.toJson(loginAnswer);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {
    }

    @Override
    public void destroy() {
    }
}
