package com.alphabibber.websocketservice.controller.v1;


import com.alphabibber.websocketservice.service.SpaceUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.web.bind.annotation.*;

import javax.websocket.server.PathParam;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path="/api/v1/space/{spaceID}")
public class SpaceController extends SpringBootServletInitializer {

    private final SpaceUserService spaceUserService = new SpaceUserService();

    @GetMapping("/members")
    public Integer getAllSpaces(@PathVariable String spaceID) {
        return this.spaceUserService.size(spaceID);
    }

}
