package com.alphabibber.authservice.service;

import com.alphabibber.authservice.model.User;
import com.alphabibber.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public User updateRefreshToken(User user, String newRefreshToken) {
        user.setRefreshToken(newRefreshToken);
        return userRepository.save(user);
    }
}
