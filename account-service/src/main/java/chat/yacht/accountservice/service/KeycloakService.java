package chat.yacht.accountservice.service;

import kong.unirest.HttpResponse;
import kong.unirest.JsonNode;
import kong.unirest.Unirest;
import kong.unirest.json.JSONObject;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.Calendar;

// See here for a documentation of the API
// https://www.keycloak.org/docs-api/5.0/rest-api/index.html#_users_resource

@Service
public class KeycloakService {
    private String accessToken = null;
    private String refreshToken = null;
    private Timestamp expiryDateAccessToken = null;
    private Timestamp expiryDateRefreshToken = null;
    private String URL = System.getenv("KEYCLOAK_PROTOCOL") + "://" + System.getenv("KEYCLOAK_URL") + "/auth/";
    private String REALM = System.getenv("KEYCLOAK_REALM");
    private String PASSWORD = System.getenv("KEYCLOAK_PASSWORD");
    private String NAME = System.getenv("KEYCLOAK_USER");

// TODO: Create a user that we do not need to use the admin user to make the changes for the user

    public KeycloakService(){
    }

    public HttpResponse<JsonNode> getUserById(String id) {
        checkTokens();
        HttpResponse<JsonNode> response = Unirest
                .get(URL + "admin/realms/" + REALM + "/users/" + id)
                .header("Authorization", "Bearer " + accessToken)
                .asJson();
        return response;
    }

    public HttpResponse<JsonNode> getUserByEmail(String mail) {
        checkTokens();
        HttpResponse<JsonNode> response = Unirest
                .get(URL + "admin/realms/" + REALM + "/users?email=" + mail)
                .header("Authorization", "Bearer " + accessToken)
                .asJson();
        return response;
    }

    public HttpResponse<JsonNode> updateUserById(String data, String id){
        checkTokens();
        JsonNode user = new JsonNode(data);
        HttpResponse<JsonNode> response = Unirest
                .put(URL + "admin/realms/" + REALM + "/users/" + id)
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .body(user)
                .asJson();
        return response;
    }

    public HttpResponse<JsonNode> updateUserImageById(String url, String id){
        checkTokens();
        String jsonString = new JSONObject()
                .put("attributes", new JSONObject().put("profile_image", url))
                .toString();
        JsonNode data = new JsonNode(jsonString);
        HttpResponse<JsonNode> response = Unirest
                .put(URL + "admin/realms/" + REALM + "/users/" + id)
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .body(data)
                .asJson();
        return response;
    }

    private void getNewToken(){
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
                getNewToken();
            }
            else{
                getNewAccessToken();
            }
        }
    }
}

