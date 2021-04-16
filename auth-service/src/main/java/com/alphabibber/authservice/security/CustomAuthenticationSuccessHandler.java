package com.alphabibber.authservice.security;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.alphabibber.authservice.model.User;
import com.alphabibber.authservice.service.UserService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

/**
 * This class handles the AuthenticationSuccess event by setting the redirect uri with
 * the user's idToken and accessToken in order to pass these values to the frontend. Both tokens
 * have an expiration time of 1 hour. If we receive a refreshToken it needs to be stored persistently in
 * the database.
 * The custom method in this Handler Class is "handle" (and the Constructor).
 * In order to retrieve these tokens we need access to the OAuth2AuthorizedClientService and the
 * UserService. Because the CustomAuthenticationSuccessHandler is not a Spring Bean we need to pass
 * these services via the Constructor instead of using Field Injection (e.g. via "Autowired").
 *
 * @author Christopher Schütz
 */
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    protected final Log logger = LogFactory.getLog(this.getClass());

    private final RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    OAuth2AuthorizedClientService authorizedClientService;
    UserService userService;

    public CustomAuthenticationSuccessHandler(
            OAuth2AuthorizedClientService clientService,
            UserService userService
    ) {
        super();
        this.authorizedClientService = clientService;
        this.userService = userService;
    }

    @Override
    public void onAuthenticationSuccess(
            final HttpServletRequest request,
            final HttpServletResponse response,
            final Authentication authentication
    ) throws IOException {
        handle(request, response, authentication);
        clearAuthenticationAttributes(request);
    }

    protected void handle(
            final HttpServletRequest request,
            final HttpServletResponse response,
            final Authentication authentication
    ) throws IOException {

        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                authToken.getAuthorizedClientRegistrationId(),
                authToken.getName());

        if (client.getRefreshToken() != null) {
            // if this is the first time of the user registering and thus establishing
            // a Google Session, save his refresh token in the database
            String userId = client.getPrincipalName();
            String refreshToken = client.getRefreshToken().getTokenValue();

            User user = this.userService.getUserById(userId);

            if (user != null) {
                this.userService.updateRefreshToken(user, refreshToken);
            } else {
                user = new User(
                        userId,
                        refreshToken
                );
                this.userService.createUser(user);
            }
        }


        DefaultOidcUser myPrincipal = (DefaultOidcUser) authentication.getPrincipal();

        String idToken = myPrincipal.getIdToken().getTokenValue();

        // TODO: Discuss correct Endpoint with Tristan and Marcel and then set this endpoint via an
        // environment variable
        String destinationHost = "https://www.alphabibber.com";

        final String targetUrl = String.format(
                destinationHost + "?id_token=%s&user_id=%s",
                idToken,
                myPrincipal.getName()
        );

        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        redirectStrategy.sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(final Authentication authentication) {

        Map<String, String> roleTargetUrlMap = new HashMap<>();
        roleTargetUrlMap.put("ROLE_USER", "/homepage.html");
        roleTargetUrlMap.put("ROLE_ADMIN", "/console.html");

        final Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        for (final GrantedAuthority grantedAuthority : authorities) {

            String authorityName = grantedAuthority.getAuthority();
            if (roleTargetUrlMap.containsKey(authorityName)) {
                return roleTargetUrlMap.get(authorityName);
            }
        }

        throw new IllegalStateException();
    }

    /**
     * Removes temporary authentication-related data which may have been stored in the session
     * during the authentication process.
     */
    protected final void clearAuthenticationAttributes(final HttpServletRequest request) {
        final HttpSession session = request.getSession(false);

        if (session == null) {
            return;
        }

        session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
    }

}
