package com.alphabibber.spacesservice.service;

import com.alphabibber.spacesservice.model.User;
import com.alphabibber.spacesservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public void deleteUserById(String id) {
        User userToDelete = userRepository.findById(id).orElse(null);
        assert userToDelete != null;
        userRepository.delete(userToDelete);
    }
}
