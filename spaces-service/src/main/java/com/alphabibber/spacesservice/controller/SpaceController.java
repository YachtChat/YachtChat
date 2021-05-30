package com.alphabibber.spacesservice.controller;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.model.User;
import com.alphabibber.spacesservice.service.SpaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path="/api/v1/spaces")
public class SpaceController extends SpringBootServletInitializer {

    private final SpaceService spaceService;

    @Autowired
    public SpaceController(
            SpaceService spaceService
    ) {
        this.spaceService = spaceService;
    }

    @GetMapping("/")
    public Set<Space> getAllSpaces() {
        return spaceService.getSpaces();
    }

    @PostMapping("/")
    public Space createSpace(@RequestBody Space spaceDTO) {
        return spaceService.createSpace(spaceDTO);
    }

    @DeleteMapping("/{spaceId}/")
    public void deleteSpace(@PathVariable String spaceId) {
        spaceService.deleteSpaceById(spaceId);
    }

    @GetMapping(path = "/{spaceId}/allUsers/")
    public Set<User> getSpaceUsers(@PathVariable String spaceId) {
        var space = spaceService.getSpaceById(spaceId);
        return space.getAllUsers();
    }

    @GetMapping(path = "/{spaceId}/members/")
    public Set<User> getSpaceMembers(@PathVariable String spaceId) {
        var space = spaceService.getSpaceById(spaceId);

        var members = new HashSet<User>();
        space.getSpaceMembers().forEach(spaceMember -> members.add(spaceMember.getMember()));

        return members;
    }

    @PostMapping(path = "/{spaceId}/members/")
    public Space addSpaceMember(@PathVariable String spaceId, @RequestParam String memberId) {
        return spaceService.addSpaceMember(spaceId, memberId);
    }

    @DeleteMapping(path = "/{spaceId}/members/")
    public Space removeSpaceMember(@PathVariable String spaceId, @RequestParam String memberId) {
        return spaceService.removeSpaceMember(spaceId, memberId);
    }

    @GetMapping(path = "/{spaceId}/hosts/")
    public Set<User> getSpaceHosts(@PathVariable String spaceId) {
        var space = spaceService.getSpaceById(spaceId);

        var hosts = new HashSet<User>();
        space.getSpaceHosts().forEach(spaceHost -> hosts.add(spaceHost.getHost()));

        return hosts;
    }

    @PostMapping(path = "/{spaceId}/hosts/")
    public Space addSpaceHost(@PathVariable String spaceId, @RequestParam String hostId) {
        return spaceService.addSpaceHost(spaceId, hostId);
    }

    @DeleteMapping(path = "/{spaceId}/hosts/")
    public Space removeSpaceHost(@PathVariable String spaceId, @RequestParam String hostId) {
        return spaceService.removeSpaceHost(spaceId, hostId);
    }

    @GetMapping(path = "/{spaceId}/canUserJoin/")
    public HashMap<String, Boolean> canUserJoin(@PathVariable String spaceId) {
        var boolResponse = spaceService.canCurrentUserJoinSpace(spaceId);

        HashMap<String, Boolean> map = new HashMap<>();
        map.put("valid", boolResponse);

        return map;
    }

}
