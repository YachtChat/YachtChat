package com.alphabibber.spacesservice.controller;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.model.User;
import com.alphabibber.spacesservice.repository.SpaceRepository;
import com.alphabibber.spacesservice.repository.UserRepository;
import com.alphabibber.spacesservice.service.SpaceService;
import com.alphabibber.spacesservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path="/spaces")
public class SpaceController extends SpringBootServletInitializer {

    @Autowired
    private SpaceService spaceService;

    @Autowired
    private SpaceRepository spaceRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/")
    public List<Space> getAllSpaces() {

        return spaceService.getSpaces();
    }

    @GetMapping("/users/")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/createSpace")
    public Space createSpace(@RequestParam String name, @RequestParam(required = false) String ownerId) {
        if (ownerId != null) {
            User user = userService.getUserById(ownerId);
            return spaceService.createSpace(new Space(name, user));
        }
        return spaceService.createSpace(new Space(name));
    }

    @DeleteMapping("/{spaceId}/deleteSpace")
    public void deleteSpace(@PathVariable String spaceId) {
        spaceService.deleteSpaceById(spaceId);
    }

    @PostMapping("/users/createUser")
    public User createUser(@RequestParam String name) {
        return userService.createUser(new User(name));
    }

    @DeleteMapping("/users/{userId}/deleteUser")
    public void deleteUser(@PathVariable String userId) {
        userService.deleteUserById(userId);
    }

    @GetMapping(path = "/{spaceId}/getUsers")
    public List<User> getSpaceUsers(@PathVariable String spaceId) {
        Space space = spaceService.getSpaceById(spaceId);
        return space.getUsers();
    }

    @GetMapping(path = "/{spaceId}/canUserJoin")
    public HashMap<String, Boolean> canUserJoinSpace(@PathVariable String spaceId, @RequestParam String userId) {
        Boolean boolResponse = spaceService.getSpaceById(spaceId).getUsers()
                        .stream()
                        .anyMatch(user -> user.getId().equals(userId));

        HashMap<String, Boolean> map = new HashMap<>();
        map.put("valid", boolResponse);
        return map;
    }

    @PostMapping(path = "/{spaceId}/addParticipant")
    public User addParticipant(@PathVariable String spaceId, @RequestParam String userId) {
        User foundUser = userService.getUserById(userId);
        Space space = spaceService.getSpaceById(spaceId);

        space.addUser(foundUser);
        foundUser.setSpace(space);

        spaceRepository.save(space);
        userRepository.save(foundUser);

        return foundUser;
    }

    @DeleteMapping(path = "/{spaceId}/removeParticipant")
    public void removeParticipant(@PathVariable String spaceId, @RequestParam String userId) {
        userService.deleteUserById(userId);
    }

}
