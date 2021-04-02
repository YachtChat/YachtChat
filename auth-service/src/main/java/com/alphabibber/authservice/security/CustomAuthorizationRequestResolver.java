package com.alphabibber.authservice.security;


import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * The difference between this RequestResolver and the default RequestResolver is that we need
 * an additional parameter (necessary to receive a refresh token) on the authorization request we
 * send to Google. This logic can be found in the "customAuthorizationRequest" method.
 *
 * @author  Christopher Schütz
 */
public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {
    private final OAuth2AuthorizationRequestResolver defaultAuthorizationRequestResolver;

    public CustomAuthorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository) {

        this.defaultAuthorizationRequestResolver =
                new DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrationRepository, "/oauth2/authorization");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest authorizationRequest =
                this.defaultAuthorizationRequestResolver.resolve(request);

        return authorizationRequest != null ?
            customAuthorizationRequest(authorizationRequest) :
            null;
    }

    @Override
    public OAuth2AuthorizationRequest resolve(
            HttpServletRequest request, String clientRegistrationId) {

        OAuth2AuthorizationRequest authorizationRequest =
                this.defaultAuthorizationRequestResolver.resolve(
                        request, clientRegistrationId);

        return authorizationRequest != null ?
            customAuthorizationRequest(authorizationRequest) :
            null;
    }

    private OAuth2AuthorizationRequest customAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest) {

        Map<String, Object> additionalParameters =
                new LinkedHashMap<>(authorizationRequest.getAdditionalParameters());

        // If the following line is uncommented, the user has to fill out Google Sign-In prompt
        // every time that he hits the authorization endpoint and everytime he successfully
        // signs in this auth-service OAUTH2 client will receive a new refresh token belonging to
        // the user. However, the amount of user-client refresh tokens that a client can request is
        // limited (to 50) by Google, so we should not request a new refresh Token every time.

        // additionalParameters.put("prompt", "consent");

        // This parameter returns us also the refresh token (besides the access token) upon the first
        // establishment of a Google Session by the User.
        // EXAMPLE:
        // If the user logs into our App in Chrome for the first time we receive a refresh token
        // and an access token. If he proceeds to close Chrome and opens up Chrome again he will have
        // an active session with Google open (provided he didn't logout) and we will receive only an access
        // token. Therefore, we already should have the refresh token saved after his first request.
        // If he established a session in Chrome and he now wants to login in Firefox for the first time
        // we will again receive a new refresh token since this is the first Google Session establishment.

        additionalParameters.put("access_type", "offline");

        return OAuth2AuthorizationRequest.from(authorizationRequest)
                .additionalParameters(additionalParameters)
                .build();
    }
}
