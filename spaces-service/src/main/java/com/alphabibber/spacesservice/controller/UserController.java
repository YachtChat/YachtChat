package com.alphabibber.spacesservice.controller;

import com.alphabibber.spacesservice.model.User;
import com.alphabibber.spacesservice.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path="/api/users")
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService
    ) {
        this.userService = userService;
    }

    @GetMapping("/")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/")
    public User createUser(@RequestParam String name) {
        return userService.createUser(new User(name));
    }

    @DeleteMapping("/{userId}/")
    public void deleteUser(@PathVariable String userId) {
        userService.deleteUserById(userId);
    }

}
