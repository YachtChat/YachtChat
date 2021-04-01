package com.alphabibber.authservice.security;

import com.alphabibber.authservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    @Autowired
    public OAuth2AuthorizedClientService authorizedClientService;

    @Autowired
    public UserService userService;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .antMatchers("/newToken")
                .permitAll()
                .anyRequest()
                .authenticated()
                .and()
                .oauth2Login()
                    .authorizationEndpoint()
                    .authorizationRequestResolver(
                            new CustomAuthorizationRequestResolver(
                                this.clientRegistrationRepository))
                    .and()
                    .successHandler(new CustomAuthenticationSuccessHandler(
                            authorizedClientService,
                            userService
                    ))
        ;
    }

    @Bean
    public AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository() {
        return new HttpSessionOAuth2AuthorizationRequestRepository();
    }

}
