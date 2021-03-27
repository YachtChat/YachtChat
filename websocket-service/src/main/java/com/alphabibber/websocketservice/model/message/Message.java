package com.alphabibber.websocketservice.model.message;

import lombok.Getter;
import lombok.Setter;

public abstract class Message {
    // It is probably better to store the Type in an enum
    @Getter @Setter
    String type;
}


