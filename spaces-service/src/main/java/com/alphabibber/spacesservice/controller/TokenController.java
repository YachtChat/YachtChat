package com.alphabibber.spacesservice.controller;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.service.SpaceService;
import com.alphabibber.spacesservice.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path = "/api/v1/tokens")
public class TokenController {

    private final TokenService tokenService;
    private final SpaceService spaceService;

    @Autowired
    public TokenController(
            SpaceService spaceService,
            TokenService tokenService
    ) {
        this.spaceService = spaceService;
        this.tokenService = tokenService;
    }

    @GetMapping(path = "/invitation")
    public String getInviteToken(@RequestParam String spaceId) {
        return tokenService.getInviteTokenForSpaceAndExistingUser(spaceId);
    }

    @PostMapping(path = "/joinWithInvitation")
    public Space joinWithInviteToken(@RequestParam String inviteToken) {
        return tokenService.parseInviteToken(inviteToken, spaceService::addSpaceMemberWithJwtClaims);
    }

}
