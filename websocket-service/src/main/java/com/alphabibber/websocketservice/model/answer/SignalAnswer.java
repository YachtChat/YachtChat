package com.alphabibber.websocketservice.model.answer;

import com.google.gson.JsonObject;
import lombok.Getter;
import lombok.Setter;

public class SignalAnswer extends Answer{
    @Getter @Setter
    private JsonObject content;

    @Getter @Setter
    private String senderId;

    public SignalAnswer(JsonObject content, String senderId) {
        super("signal");
        this.content = content;
        this.senderId = senderId;
    }
}
