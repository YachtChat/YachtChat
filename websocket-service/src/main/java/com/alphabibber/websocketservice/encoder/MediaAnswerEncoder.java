package com.alphabibber.websocketservice.encoder;

import com.alphabibber.websocketservice.model.answer.MediaAnswer;
import com.alphabibber.websocketservice.model.answer.NewUserAnswer;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class MediaAnswerEncoder implements Encoder.Text<MediaAnswer> {
    // tell gson to just use field for serialization that are annotated
    Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();

    @Override
    public String encode(MediaAnswer mediaAnswer) throws EncodeException {
        return gson.toJson(mediaAnswer);
    }

    @Override
    public void init(EndpointConfig endpointConfig) {
    }

    @Override
    public void destroy() {
    }
}
