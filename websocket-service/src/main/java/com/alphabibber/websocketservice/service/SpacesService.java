package com.alphabibber.websocketservice.service;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class SpacesService {
    private final String URL = "https://" + System.getenv("SPACES_URL") + "/api/v1/spaces/";
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .build();
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    public boolean isUserAllowedToJoin(String roomId, String token){
        // Check if the user is allowed to enter the space
        return sendRequest(URL + roomId + "/canUserJoin/", token);
    }

    public boolean isUserHost(String roomId, String token){
        // Check if the user is host for the space
        return sendRequest(URL + roomId + "/isUserHost/", token);
    }

    public boolean removeUserFromSpace(String roomId, String token, String userId){
        String requestUrl = URL + roomId + "/members/?memberId=" + userId;
        HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create(requestUrl))
                .header("authorization", "Bearer " + token)
                .build();
        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            log.error("Spaces server did not answer on {}", requestUrl);
            log.error(String.valueOf(e.getStackTrace()));
            return false;
        }
        return response.statusCode() == HttpStatus.OK.value();
    }

    private boolean sendRequest(String requestUrl, String token){
        HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create(requestUrl))
                .header("authorization", "Bearer " + token)
                .build();
        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            log.error("Spaces server did not answer on {}", requestUrl);
            log.error(String.valueOf(e.getStackTrace()));
            return false;
        }
        JsonObject jsonObject = JsonParser.parseString(response.body()).getAsJsonObject();
        return jsonObject.get("valid").getAsBoolean();
    }
}
