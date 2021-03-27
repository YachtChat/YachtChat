package com.alphabibber.websocketservice.model.message;

import com.alphabibber.websocketservice.model.Position;
import lombok.Getter;
import lombok.Setter;

public class PositionMessage extends Message {
    @Getter @Setter
    Position position;
}
