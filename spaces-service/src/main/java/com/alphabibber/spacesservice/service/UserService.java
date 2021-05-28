package com.alphabibber.spacesservice.service;

import com.alphabibber.spacesservice.model.User;
import com.alphabibber.spacesservice.repository.UserRepository;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.persistence.EntityNotFoundException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    public User getContextUserIfExistsElseCreate() {
        Principal principal = SecurityContextHolder.getContext().getAuthentication();
        AccessToken token = ((KeycloakPrincipal) ((KeycloakAuthenticationToken) principal).getPrincipal())
                .getKeycloakSecurityContext().getToken();

        Optional<User> userResult = userRepository.findById(token.getSubject());
        if (userResult.isPresent()) {
            return userResult.get();
        }

        // since the user needs a certified jwt from our auth server we can safely assume that this is a legit
        // user so we can create one
        var newUser = new User(token.getSubject(), token.getGivenName());
        return userRepository.save(newUser);
    }

    public boolean userHasAdminRole() {
        Principal principal = SecurityContextHolder.getContext().getAuthentication();
        return ((KeycloakAuthenticationToken) principal).getAuthorities()
                .stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_admin"));
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        if (userHasAdminRole())
            return userRepository.findAll();

        var selfList = new ArrayList<User>();
        selfList.add(getContextUserIfExistsElseCreate());
        return selfList;
    }

    public User getUserById(String id) {
        var userOrNil = userRepository.findById(id);

        if (userOrNil.isEmpty())
            throw new EntityNotFoundException("User not found");

        return userOrNil.get();
    }

    public void deleteUserById(String id) {
        var userToDelete = userRepository.findById(id).orElse(null);
        assert userToDelete != null;
        userRepository.delete(userToDelete);
    }
}
