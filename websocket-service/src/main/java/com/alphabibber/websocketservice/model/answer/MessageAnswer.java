package com.alphabibber.websocketservice.model.answer;

import com.google.gson.JsonObject;
import lombok.Getter;
import lombok.Setter;

public class MessageAnswer extends Answer {
    @Getter @Setter
    private JsonObject content;

    @Getter @Setter
    private String senderId;

    public MessageAnswer(JsonObject content, String senderId) {
        super("message");
        this.content = content;
        this.senderId = senderId;
    }
}
