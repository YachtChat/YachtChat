package com.alphabibber.authservice.controller;

import com.alphabibber.authservice.model.User;
import com.alphabibber.authservice.service.UserService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.env.Environment;

import java.io.IOException;
import java.net.ProxySelector;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@RestController
public class AuthenticationController {

    @Autowired
    private Environment env;

    @Autowired
    private UserService userService;

    // TODO: Change CORS Policy once we properly now the validated hosts urls
    @CrossOrigin(origins = "*", maxAge = 3600)
    @RequestMapping("/newToken")
    public String requestNewAccessToken(@RequestHeader(value="Authorization") String bearerToken)
            throws URISyntaxException, IOException, InterruptedException {

        // remove part in square brackets "[Bearer ]<TOKEN_VALUE>"
        String tokenValue = bearerToken.substring(7);
        HttpResponse<String> googleValidationResponse = getGoogleValidationResponse(tokenValue);

        if (googleValidationResponse.statusCode() != 200)
            return "Provided access token is not valid";

        // previous access token was valid, so generate and
        // return new one with refresh token
        JSONObject json = new JSONObject(googleValidationResponse.body());
        String principalName = json.toMap().get("sub").toString();

        HttpResponse<String> accessTokenResponse = retrieveNewGoogleAccessToken(principalName);

        if (accessTokenResponse == null)
            return "Refresh Token is not saved for user";

        return accessTokenResponse.body();
    }

    public HttpResponse<String> getGoogleValidationResponse(String idToken)
            throws URISyntaxException, IOException, InterruptedException {
        // use the tokeninfo endpoint provided by google to check the validity of the
        // provided idToken
        String suffix = "?id_token=" + idToken;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI("https://oauth2.googleapis.com/tokeninfo" + suffix))
                .GET()
                .build();

        return HttpClient
                .newBuilder()
                .proxy(ProxySelector.getDefault())
                .build()
                .send(request, HttpResponse.BodyHandlers.ofString());
    }

    public HttpResponse<String> retrieveNewGoogleAccessToken(String principalName)
            throws IOException, InterruptedException, URISyntaxException {

        User user = userService.getUserById(principalName);
        String refreshToken = user.getRefreshToken();

        if (refreshToken == null)
            return null;

        String clientId = env.getProperty("OAUTH_GOOGLE_CLIENT_ID");
        String clientSecret = env.getProperty("OAUTH_GOOGLE_CLIENT_SECRET");

        String requestBody = String.format(
                "refresh_token=%s&grant_type=%s&client_secret=%s&client_id=%s",
                refreshToken,
                "refresh_token",
                clientSecret,
                clientId
        );

        HttpRequest sndRequest = HttpRequest
                .newBuilder()
                .uri(new URI("https://oauth2.googleapis.com/token"))
                .header("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        return HttpClient
                .newBuilder()
                .proxy(ProxySelector.getDefault())
                .build()
                .send(sndRequest, HttpResponse.BodyHandlers.ofString());
    }


}
