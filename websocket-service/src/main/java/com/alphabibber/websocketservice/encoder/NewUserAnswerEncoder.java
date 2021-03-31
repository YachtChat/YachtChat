package com.alphabibber.websocketservice.encoder;

import com.alphabibber.websocketservice.model.answer.NewUserAnswer;
import com.google.gson.Gson;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class NewUserAnswerEncoder implements Encoder.Text<NewUserAnswer>{
    Gson gson = new Gson();
    @Override
    public String encode(NewUserAnswer newUserAnswer){
        return gson.toJson(newUserAnswer);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {

    }

    @Override
    public void destroy() {

    }
}
