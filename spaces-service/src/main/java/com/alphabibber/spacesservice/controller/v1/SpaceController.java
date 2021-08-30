package com.alphabibber.spacesservice.controller.v1;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.model.SpaceHost;
import com.alphabibber.spacesservice.model.User;
import com.alphabibber.spacesservice.service.SpaceService;
import com.alphabibber.spacesservice.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.web.bind.annotation.*;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotAllowedException;
import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path="/api/v1/spaces")
public class SpaceController extends SpringBootServletInitializer {

    private final SpaceService spaceService;
    private final TokenService tokenService;

    @Autowired
    public SpaceController(
            SpaceService spaceService,
            TokenService tokenService
    ) {
        this.spaceService = spaceService;
        this.tokenService = tokenService;
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
        return spaceService.addSpaceMemberWithContextUser(spaceId, memberId);
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
    public Map<String, Boolean> canUserJoin(@PathVariable String spaceId) {
        var boolResponse = spaceService.canCurrentUserJoinSpace(spaceId);

        HashMap<String, Boolean> map = new HashMap<>();
        map.put("valid", boolResponse);

        return map;
    }

    @GetMapping(path = "/{spaceId}/isUserHost/")
    public Map<String, Boolean> isUserHost(@PathVariable String spaceId){
        var boolResponse = spaceService.isCurrentUserHost(spaceId);

        HashMap<String, Boolean> map = new HashMap<>();
        map.put("valid", boolResponse);

        return map;
    }

    @PutMapping(path = "/{spaceId}/promote")
    public SpaceHost promoteMemberToHost(@PathVariable String spaceId, @RequestParam String memberId) {
        var space = spaceService.getSpaceById(spaceId);
        var userIsMemberInSpace = space.getSpaceMembers()
                .stream()
                .anyMatch(spaceMember -> spaceMember.getMember().getId().equals(memberId));

        var userIsNotAlreadyHostInSpace = space.getSpaceHosts()
                .stream()
                .noneMatch(spaceHost -> spaceHost.getHost().getId().equals(memberId));

        if (userIsMemberInSpace && userIsNotAlreadyHostInSpace) {
            return spaceService.promoteMemberToHost(spaceId, memberId);
        } else if (userIsMemberInSpace) {
            throw new NotAllowedException("User to be promoted is not member of Space");
        } else {
            throw new NotAllowedException("User is already host in Space");
        }
    }

    @GetMapping(path = "/invitation")
    public String getInviteToken(@RequestParam String spaceId) {
        return tokenService.getInviteTokenForSpaceAndExistingUser(spaceId);
    }

    @PostMapping(path = "/invitation")
    public Space joinWithInviteToken(@RequestBody Map<String, String> tokenRequest) {
        var inviteToken = tokenRequest.get("token");

        if (inviteToken == null)
            throw new BadRequestException("Invalid Token Request");

        return tokenService.parseInviteToken(inviteToken, spaceService::addSpaceMemberWithJwtClaims);
    }

}
