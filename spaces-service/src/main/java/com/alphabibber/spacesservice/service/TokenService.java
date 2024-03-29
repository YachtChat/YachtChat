package com.alphabibber.spacesservice.service;

import com.alphabibber.spacesservice.model.Space;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;

@Service
public class TokenService {

    private final UserService userService;
    private final PosthogService posthogService;

    @Value("${JWT_SECRET}")
    private String jwtSecret;

    @Autowired
    public TokenService(
            UserService userService,
            PosthogService posthogService
    ) {
        this.userService = userService;
        this.posthogService = posthogService;
    }

    private Key getSignature() {
        return new SecretKeySpec(
                Base64
                        .getDecoder()
                        .decode(jwtSecret),
                SignatureAlgorithm
                        .HS256
                        .getJcaName()
        );
    }

    public String getInviteTokenForSpaceAndExistingUser(String spaceId) {
        var user = userService.getContextUserIfExistsElseCreate();

        if (user.getMemberSpaces().stream().noneMatch(spaceMember -> spaceMember.getSpace().getId().equals(spaceId))){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "User " + user.getId() + " is not a member of the space " + spaceId
            );
        }

        // Create token with claims inviteeId and spaceId, signing etc. and return
        long jwtDurationInSeconds = (long) 60 * 60 * 24 * 7 * 4; // 4 Weeks
        return Jwts.builder()
                .claim("space", spaceId)
                .setSubject(user.getId())
                .setId(UUID.randomUUID().toString())
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(Date.from(Instant.now().plusSeconds(jwtDurationInSeconds)))
                .signWith(getSignature())
                .compact();
    }

    public Space parseInviteToken(String jwtString, Function<Claims, Space> callback) {
        var hmacKey = getSignature();

        // If the JWT Token is expired (exp claim value is less than current system time), the
        // parseClaimsJws() method will throw a SignatureException.
        Jws<Claims> jwt = Jwts.parserBuilder()
                .setSigningKey(hmacKey)
                .build()
                .parseClaimsJws(jwtString);

        var claims = jwt.getBody();

        // validated that necessary information is in token
        String spaceId = (String) claims.get("space");

        String inviterId = (String) claims.get("sub");

        // user is the user that used the invite link
        var user = userService.getContextUserIfExistsElseCreate();

        if (spaceId == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token is not valid");

        posthogService.sendEvent(user.getId(), "invited", new HashMap<>(){{
            put("inviter", inviterId);
            put("space", spaceId);
        }});
        posthogService.sendEvent(inviterId, "inviteUsed", new HashMap<>(){{
            put("invited", user.getId());
            put("space", spaceId);
        }});

        return callback.apply(claims);
    }
}
