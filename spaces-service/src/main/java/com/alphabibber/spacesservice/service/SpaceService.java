package com.alphabibber.spacesservice.service;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.model.SpaceHost;
import com.alphabibber.spacesservice.model.SpaceMember;
import com.alphabibber.spacesservice.repository.SpaceHostRepository;
import com.alphabibber.spacesservice.repository.SpaceMemberRepository;
import com.alphabibber.spacesservice.repository.SpaceRepository;
import com.alphabibber.spacesservice.repository.UserRepository;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
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
    private final SpaceMemberRepository spaceMemberRepository;
    private final UserService userService;

    @Autowired
    public SpaceService(
            SpaceRepository spaceRepository,
            UserRepository userRepository,
            SpaceHostRepository spaceHostRepository,
            SpaceMemberRepository spaceMemberRepository,
            UserService userService
    ) {
        this.spaceRepository = spaceRepository;
        this.userRepository = userRepository;
        this.spaceHostRepository = spaceHostRepository;
        this.userService = userService;
        this.spaceMemberRepository = spaceMemberRepository;
    }

    public Set<Space> getSpaces() {
        Principal principal = SecurityContextHolder.getContext().getAuthentication();

        boolean isNotAnonymousUser = ((KeycloakAuthenticationToken) principal).getAuthorities().stream().noneMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ANONYMOUS"));

        if (isNotAnonymousUser) {
            var user = userService.getContextUserIfExistsElseCreate();

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

    public Space createSpace(Space space) {
        // assumption: Space does not contain spaceHosts or spaceMembers after init
        var user = userService.getContextUserIfExistsElseCreate();

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

    public Space getSpaceById(String id) {
        Optional<Space> spaceResult = spaceRepository.findById(id);

        if (spaceResult.isEmpty())
                throw new EntityNotFoundException("Space not Found");

        var space = spaceResult.get();
        var user = userService.getContextUserIfExistsElseCreate();

        boolean userIsUserInSpace = space.getAllUsers().contains(user);

        if (!userIsUserInSpace && !space.isPublic())
            throw new AccessDeniedException("Not user in space");

        return space;
    }

    public void deleteSpaceById(String id) throws AccessDeniedException {
        var spaceToDelete = spaceRepository.getOne(id);
        var user = userService.getContextUserIfExistsElseCreate();

        boolean userIsNotHostInSpace = Collections.disjoint(spaceToDelete.getSpaceHosts(), user.getHostSpaces());

        if (userIsNotHostInSpace)
            throw new AccessDeniedException("Not host of space");

        spaceRepository.delete(spaceToDelete);
    }

    public Space addSpaceMember(String spaceId, String memberId) {
        var space = this.getSpaceById(spaceId);
        var invitor = userService.getContextUserIfExistsElseCreate();

        var member = userService.getUserById(memberId);

        boolean userIsNotHostInSpace = Collections.disjoint(space.getSpaceHosts(), invitor.getHostSpaces());

        if (userIsNotHostInSpace && !space.isPublic())
            throw new AccessDeniedException("Not host of space");

        if (space.isPublic() && !memberId.equals(invitor.getId()))
            throw new AccessDeniedException("You can only add yourself to public spaces");

        boolean inviteeNotYetMember = Collections.disjoint(space.getSpaceMembers(), member.getMemberSpaces());

        if (inviteeNotYetMember) {
            var spaceMember = new SpaceMember(member, space);
            member.addMemberSpace(spaceMember);
            space.addSpaceMember(spaceMember);

            // order matters here!
            userRepository.save(member);
            space = spaceRepository.save(space);
            spaceMemberRepository.save(spaceMember);

            return space;
        }

        return space;
    }

    public Space addSpaceMemberWithInvitorId(String spaceId, String inviteeId, String invitorId) {
        return null;
    }

    public Space removeSpaceMember(String spaceId, String memberId) {
        var space = this.getSpaceById(spaceId);
        var remover = userService.getContextUserIfExistsElseCreate();
        var member = userService.getUserById(memberId);

        boolean userIsNotHostInSpace = Collections.disjoint(space.getSpaceHosts(), remover.getHostSpaces());

        if (userIsNotHostInSpace && !space.isPublic())
            throw new AccessDeniedException("Not host of space");

        if (space.isPublic() && !memberId.equals(remover.getId()))
            throw new AccessDeniedException("You can only remove yourself from public spaces");

        var spaceMember = spaceMemberRepository.findSpaceMemberBySpaceIsAndMemberIs(space, member);

        member.removeMemberSpace(spaceMember);
        space.removeSpaceMember(spaceMember);

        userRepository.save(member);
        space = spaceRepository.save(space);
        spaceMemberRepository.delete(spaceMember);

        return space;
    }

    public Space addSpaceHost(String spaceId, String hostId) {
        var space = this.getSpaceById(spaceId);
        var invitor = userService.getContextUserIfExistsElseCreate();

        var host = userService.getUserById(hostId);

        boolean userIsNotHostInSpace = Collections.disjoint(space.getSpaceHosts(), invitor.getHostSpaces());

        if (userIsNotHostInSpace)
            throw new AccessDeniedException("Not host of space");

        boolean inviteeNotYetMember = Collections.disjoint(space.getSpaceHosts(), host.getHostSpaces());

        if (inviteeNotYetMember) {
            var spaceHost = new SpaceHost(host, space);
            host.addHostSpace(spaceHost);
            space.addSpaceHost(spaceHost);

            // order matters here!
            userRepository.save(host);
            space = spaceRepository.save(space);
            spaceHostRepository.save(spaceHost);

            return space;
        }

        return space;
    }

    public Space removeSpaceHost(String spaceId, String hostId) {
        var space = this.getSpaceById(spaceId);
        var remover = userService.getContextUserIfExistsElseCreate();
        var host = userService.getUserById(hostId);

        boolean userIsNotHostInSpace = Collections.disjoint(space.getSpaceHosts(), remover.getHostSpaces());

        if (userIsNotHostInSpace)
            throw new AccessDeniedException("Not host of space");

        var spaceHost = spaceHostRepository.findSpaceHostBySpaceIsAndHostIs(space, host);

        host.removeHostSpace(spaceHost);
        space.removeSpaceHost(spaceHost);

        userRepository.save(host);
        space = spaceRepository.save(space);
        spaceHostRepository.delete(spaceHost);

        return space;
    }

    public Boolean canCurrentUserJoinSpace(String spaceId) {
        var space = this.getSpaceById(spaceId);

        if (space.isPublic())
            return true;

        var currentUser = userService.getUserIfExistsElseCreate();
        return space.getAllUsers().contains(currentUser);
    }

}
