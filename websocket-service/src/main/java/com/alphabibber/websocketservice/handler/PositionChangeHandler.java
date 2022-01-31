package com.alphabibber.websocketservice.handler;

import com.alphabibber.websocketservice.WsServerEndpoint;
import com.alphabibber.websocketservice.model.Position;
import com.alphabibber.websocketservice.model.User;
import com.alphabibber.websocketservice.model.answer.PositionAnswer;
import com.alphabibber.websocketservice.service.SpaceUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.EncodeException;
import javax.websocket.Session;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;

public class PositionChangeHandler {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final SpaceUserService spaceUserService = new SpaceUserService();

    public void handlePositinChange(String spaceId, String sessionID, Position position){
        User changedUser = spaceUserService.setUserPosition(spaceId, sessionID, position);

        // get user global id for the PositonAnswer id
        PositionAnswer answer = new PositionAnswer(position, changedUser.getId());

        try {
            WsServerEndpoint.broadcast(spaceUserService.getUserSet(spaceId), answer, changedUser.getId());
        } catch (EncodeException | IOException e) {
            log.error("{}: Could not send new Position", changedUser.getId());
            log.error(String.valueOf(e.getStackTrace()));
        }
    }
}
