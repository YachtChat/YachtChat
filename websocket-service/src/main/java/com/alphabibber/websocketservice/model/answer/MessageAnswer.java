package com.alphabibber.websocketservice.model.answer;

import com.google.gson.JsonObject;
import lombok.Getter;
import lombok.Setter;

public class MessageAnswer extends Answer {
    @Getter @Setter
    private String content;

    @Getter @Setter
    private String sender_id;

    public MessageAnswer(String content, String sender_id) {
        super("message");
        this.content = content;
        this.sender_id = sender_id;
    }
}
