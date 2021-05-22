package com.alphabibber.spacesservice.controller;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.model.SpaceMember;
import com.alphabibber.spacesservice.model.User;
import com.alphabibber.spacesservice.repository.SpaceMemberRepository;
import com.alphabibber.spacesservice.repository.UserRepository;
import com.alphabibber.spacesservice.service.SpaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path="/api/spaces")
public class SpaceController extends SpringBootServletInitializer {

    private final SpaceService spaceService;

    private final UserRepository userRepository;
    private final SpaceMemberRepository spaceMemberRepository;

    @Autowired
    public SpaceController(
            SpaceService spaceService,
            UserRepository userRepository,
            SpaceMemberRepository spaceMemberRepository
    ) {
        this.spaceService = spaceService;
        this.userRepository = userRepository;
        this.spaceMemberRepository = spaceMemberRepository;
    }

    @GetMapping("/")
    public Set<Space> getAllSpaces() {
        return spaceService.getSpaces();
    }

    @PostMapping("/")
    public Space createSpace(@RequestParam String name) {
        return spaceService.createSpace(new Space(name));
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

    @GetMapping(path = "/{spaceId}/hosts/")
    public Set<User> getSpaceHosts(@PathVariable String spaceId) {
        var space = spaceService.getSpaceById(spaceId);

        var hosts = new HashSet<User>();
        space.getSpaceHosts().forEach(spaceHost -> hosts.add(spaceHost.getHost()));

        return hosts;
    }

    @PostMapping(path = "/{spaceId}/members/")
    public User addSpaceMember(@PathVariable String spaceId, @RequestBody User member) {
        var space = spaceService.getSpaceById(spaceId);

        var spaceMember = new SpaceMember(member, space);

        space.addSpaceMember(spaceMember);
        member.addMemberSpace(spaceMember);

        spaceService.saveSpace(space);
        member = userRepository.save(member);
        spaceMemberRepository.save(spaceMember);

        return member;
    }

}
