package com.alphabibber.websocketservice.controller.v1;


import com.alphabibber.websocketservice.service.SpaceUserService;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.web.bind.annotation.*;

import javax.websocket.server.PathParam;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path="/api/v1/space")
public class SpaceController extends SpringBootServletInitializer {

    private final SpaceUserService spaceUserService = new SpaceUserService();

    @GetMapping("/{spaceID}/members")
    public Integer getAllSpaces(@PathVariable String spaceID) {
        return this.spaceUserService.size(spaceID);
    }

    @PostMapping(path = "/members")
    public Map<String, Integer> joinWithInviteToken(@RequestBody String[] spaces) {
        Map<String, Integer> member = new HashMap<String, Integer>(spaces.length);

        for (String s : spaces) {
            member.put(s, spaceUserService.size(s));
        }

        return member;
    }

}
