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

    @Value("${JWT_SECRET}")
    private String jwtSecret;

    @Autowired
    public TokenService(
            UserService userService
    ) {
        this.userService = userService;
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

        // Create token with claims inviteeId and spaceId, signing etc. and return
        long jwtDurationInSeconds = (long) 60 * 60 * 24; // 1 DAY
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

        if (spaceId == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token is not valid");

        return callback.apply(claims);
    }
}
