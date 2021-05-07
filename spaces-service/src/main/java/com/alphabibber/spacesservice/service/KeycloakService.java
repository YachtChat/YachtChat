package com.alphabibber.spacesservice.service;

import kong.unirest.HttpResponse;
import kong.unirest.JsonNode;
import kong.unirest.Unirest;
import kong.unirest.json.JSONObject;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

// See here for a documentation of the API
// https://www.keycloak.org/docs-api/5.0/rest-api/index.html#_users_resource

@Service
public class KeycloakService {
    private String accessToken = null;
    private String refreshToken = null;
    private Timestamp expiryDateAccessToken = null;
    private Timestamp expiryDateRefreshToken = null;
    private String URL = "https://keycloak.alphabibber.com/auth/";
    private String REALM = "Application";
    private String PASSWORD = System.getenv("KEYCLOAK_PASSWORD");
    private String NAME = "Admin";

    public KeycloakService(){
    }

    public JSONObject getUserById(String id) {
        checkTokens();
        HttpResponse<JsonNode> response = Unirest
                .get(URL + "/admin/realms/" + REALM + "/users/" + id)
                .header("Authorization", "Bearer " + accessToken)
                .asJson();
        if(response.getStatus() == 404){
//            User not found
        }
        return response.getBody().getObject();
    }


    public JSONObject getUserByEmail(String mail) {
        checkTokens();
        HttpResponse<JsonNode> response = Unirest
                .get(URL + "/admin/realms/" + REALM + "/users?email=" + mail)
                .header("Authorization", "Bearer " + accessToken)
                .asJson();
        if(response.getStatus() == 404){
//            User not found
        }
        return response.getBody().getObject();
    }

    public void updateUserById(String id){
        Map<String, String> data = new HashMap<>();
        data.put("username", "testnew");
        JSONObject body = new JSONObject(data);

        checkTokens();
        HttpResponse<JsonNode> response = Unirest
                .put(URL + "admin/realms/" + REALM + "users/" + id)
                .header("Authorization", "Bearer " + accessToken)
                .field(body)
                .asJson();
    }


    private void getNewTokens(){
        HttpResponse<JsonNode> response = Unirest.post(URL + "realms/master/protocol/openid-connect/token")
                .header("content-type", "application/x-www-form-urlencoded")
                .field("username", NAME)
                .field("password", PASSWORD)
                .field("client_id", "admin-cli")
                .field("grant_type", "password")
                .asJson();

        JSONObject res = response.getBody().getObject();
        accessToken = res.getString("access_token");
        refreshToken = res.getString("refresh_token");
        Calendar now = Calendar.getInstance();
        now.add(Calendar.SECOND, 60);
        expiryDateAccessToken = new Timestamp(now.getTimeInMillis());
        now = Calendar.getInstance();
        now.add(Calendar.SECOND, 1800);
        expiryDateRefreshToken = new Timestamp(now.getTimeInMillis());
    }

    private void getNewAccessToken(){
        HttpResponse<JsonNode> response = Unirest.post(URL + "realms/master/protocol/openid-connect/token")
                .header("content-type", "application/x-www-form-urlencoded")
                .field("client_id", "admin-cli")
                .field("grant_type", "refresh_token")
                .field("refresh_token", refreshToken)
                .asJson();

        JSONObject res = response.getBody().getObject();
        accessToken = res.getString("access_token");
        Calendar now = Calendar.getInstance();
        now.add(Calendar.SECOND, 59);
        expiryDateAccessToken = new Timestamp(now.getTimeInMillis());
    }

    private void checkTokens(){
        Calendar now = Calendar.getInstance();
        if (accessToken == null || expiryDateAccessToken.before(new Timestamp(now.getTimeInMillis()))){
            if (refreshToken == null || expiryDateRefreshToken.before(new Timestamp(now.getTimeInMillis()))){
                getNewTokens();
            }
            else{
                getNewAccessToken();
            }
        }
    }
}
