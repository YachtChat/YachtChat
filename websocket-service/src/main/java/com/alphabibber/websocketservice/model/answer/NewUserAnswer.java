package com.alphabibber.websocketservice.model.answer;

import com.alphabibber.websocketservice.model.Position;
import lombok.Getter;
import lombok.Setter;

public class NewUserAnswer extends Answer{
    @Getter @Setter
    private String id;
    @Getter @Setter
    private Position position;
    @Getter @Setter
    private boolean video;
    @Getter @Setter
    private boolean audio;
    public NewUserAnswer(String id, Position position, boolean video, boolean audio){
        super("new_user");
        this.id = id;
        this.position = position;
        this.video = video;
        this.audio = audio;
    }
}
