package com.alphabibber.spacesservice.service;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.model.SpaceHost;
import com.alphabibber.spacesservice.model.User;
import com.alphabibber.spacesservice.repository.SpaceHostRepository;
import com.alphabibber.spacesservice.repository.SpaceRepository;
import com.alphabibber.spacesservice.repository.UserRepository;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import javax.persistence.EntityNotFoundException;
import java.security.Principal;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class SpaceService {

    private final SpaceRepository spaceRepository;
    private final UserRepository userRepository;
    private final SpaceHostRepository spaceHostRepository;

    @Autowired
    public SpaceService(
            SpaceRepository spaceRepository,
            UserRepository userRepository,
            SpaceHostRepository spaceHostRepository
    ) {
        this.spaceRepository = spaceRepository;
        this.userRepository = userRepository;
        this.spaceHostRepository = spaceHostRepository;
    }

    public Space createSpace(Space space) {
        // assumption: Space does not contain spaceHosts or spaceMembers after init
        var user = getUserIfExistsElseCreate();

        var spaceHost = new SpaceHost(user, space);
        user.addHostSpace(spaceHost);
        space.addSpaceHost(spaceHost);

        // order matters here!
        userRepository.save(user);
        space = spaceRepository.save(space);
        spaceHostRepository.save(spaceHost);

        return space;
    }

    public void saveSpace(Space space) {
        spaceRepository.save(space);
    }

    private User getUserIfExistsElseCreate() {
        Principal principal = SecurityContextHolder.getContext().getAuthentication();
        AccessToken token = ((KeycloakPrincipal) ((KeycloakAuthenticationToken) principal).getPrincipal())
                .getKeycloakSecurityContext().getToken();

        Optional<User> userResult = userRepository.findById(token.getSubject());
        if (userResult.isPresent()) {
            return userResult.get();
        }
        var newUser = new User(token.getSubject(), token.getGivenName());
        return userRepository.save(newUser);
    }


    public Set<Space> getSpaces() {
        Principal principal = SecurityContextHolder.getContext().getAuthentication();

        boolean isNotAnonymousUser = ((KeycloakAuthenticationToken) principal).getAuthorities().stream().noneMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ANONYMOUS"));

        if (isNotAnonymousUser) {
            var user = this.getUserIfExistsElseCreate();

            var result = new HashSet<Space>();

            user.getHostSpaces().forEach(spaceHost ->
                    result.addAll(spaceRepository.findAllBySpaceHostsContains(spaceHost))
            );
            user.getMemberSpaces().forEach(spaceMember ->
                    result.addAll(spaceRepository.findAllBySpaceMembersContains(spaceMember))
            );
            result.addAll(spaceRepository.findAllByPublicAccessIsTrue());

            return result;
        }

        return spaceRepository.findAllByPublicAccessIsTrue();
    }

    public Space getSpaceById(String id) {
        Optional<Space> spaceResult = spaceRepository.findById(id);

        if (spaceResult.isEmpty())
                throw new EntityNotFoundException("Space not Found");

        var space = spaceResult.get();
        var user = getUserIfExistsElseCreate();

        boolean userIsUserInSpace = space.getAllUsers().contains(user);

        if (!userIsUserInSpace)
            throw new AccessDeniedException("Not user in space");

        return space;
    }

    public void deleteSpaceById(String id) throws AccessDeniedException {
        var spaceToDelete = spaceRepository.getOne(id);
        var user = getUserIfExistsElseCreate();

        boolean userIsNotHostInSpace = Collections.disjoint(spaceToDelete.getSpaceHosts(), user.getHostSpaces());

        if (userIsNotHostInSpace)
            throw new AccessDeniedException("Not host of space");

        spaceRepository.delete(spaceToDelete);
    }
}
