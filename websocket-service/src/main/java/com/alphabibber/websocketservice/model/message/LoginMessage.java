package com.alphabibber.websocketservice.model.message;

import lombok.Getter;
import lombok.Setter;

public class LoginMessage extends Message {
    @Getter @Setter
    String userId;
}
