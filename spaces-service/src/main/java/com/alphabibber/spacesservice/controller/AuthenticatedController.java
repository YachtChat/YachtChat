//package com.alphabibber.spacesservice.controller;
//
////import org.springframework.beans.factory.annotation.Autowired;
////import org.springframework.context.annotation.Bean;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContext;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
//import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
//import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.security.Principal;
//
//@RestController
//public class AuthenticatedController {
//
//    @GetMapping("/authenticated")
//    public Boolean authenticated() {
//        SecurityContext securityContext = SecurityContextHolder.getContext();
//        Authentication authentication = securityContext.getAuthentication();
//        if (authentication != null) {
//            return authentication.getAuthorities().stream()
//                    .noneMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ANONYMOUS"));
//        }
//        return false;
//    }
//
//    @Autowired
//    private OAuth2AuthorizedClientService authorizedClientService;
//
//    @GetMapping("/authenticationToken")
//    public String getAuthenticationToken() {
//        SecurityContext securityContext = SecurityContextHolder.getContext();
//        Authentication authentication = securityContext.getAuthentication();
//
//        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
//
//        OAuth2AuthorizedClient client =
//                authorizedClientService.loadAuthorizedClient(
//                        authToken.getAuthorizedClientRegistrationId(),
//                        authToken.getName());
//
//        return client.getAccessToken().getTokenValue();
//    }
//
//    @RequestMapping("/user") public Principal user() {
//        return SecurityContextHolder.getContext().getAuthentication();
//    }
//
//
//}
