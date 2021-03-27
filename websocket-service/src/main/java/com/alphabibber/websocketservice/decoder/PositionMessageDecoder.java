package com.alphabibber.websocketservice.decoder;

import com.alphabibber.websocketservice.model.message.PositionMessage;
import com.google.gson.Gson;

import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;

public class PositionMessageDecoder implements Decoder.Text<PositionMessage> {
    private static Gson gson = new Gson();

    @Override
    public PositionMessage decode(String s) throws DecodeException{
        return gson.fromJson(s, PositionMessage.class);
    }

    @Override
    public boolean willDecode(String s){
        return (s != null);
    }

    @Override
    public void init(EndpointConfig ec){

    }

    @Override
    public void destroy() {
        // Close resources
    }
}
