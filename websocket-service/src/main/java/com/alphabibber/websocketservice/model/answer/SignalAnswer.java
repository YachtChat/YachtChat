package com.alphabibber.websocketservice.model.answer;

import lombok.Getter;
import lombok.Setter;

public class SignalAnswer extends Answer{
    @Getter @Setter
    private String content;

    @Getter @Setter
    private String sender_id;

    public SignalAnswer(String content, String sender_id) {
        super("signal");
        this.content = content;
        this.sender_id = sender_id;
    }
}
