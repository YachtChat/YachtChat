package chat.yacht.accountservice.service;

import kong.unirest.HttpResponse;
import kong.unirest.JsonNode;
import kong.unirest.Unirest;
import kong.unirest.json.JSONArray;
import kong.unirest.json.JSONException;
import kong.unirest.json.JSONObject;
import org.keycloak.representations.AccessToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * This class can be used to make changes for user in Keyclaok
 */
@Service
public class ProfileService {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    private final String LINKEDIN_ID = "LinkedInId";

    @Autowired
    private KeycloakService keycloakService;

    public void checkProfile(AccessToken token, String plainToken){
        Map<String, Object> userAttributes = token.getOtherClaims();

        if (userAttributes.containsKey(LINKEDIN_ID)){
            log.info("LinkedIn Image will be updated for user " + token.getSubject());
            String likedInToken = keycloakService.getLinkedInToken(token, plainToken);
            String imageUrl = null;
            try{
                imageUrl = getLinkedInImageUrl(likedInToken);
            } catch(JSONException e) {
                log.error("LinkedIn image url couldn't be fetched");
            }
            keycloakService.updateUserImageById(imageUrl, token.getSubject());
        }
    }

    private String getLinkedInImageUrl(String likedInToken){
        String url = "https://api.linkedin.com/v2/me?projection=(profilePicture(displayImage~:playableStreams))";
        HttpResponse<JsonNode> response = Unirest
                .get(url)
                .header("Authorization", "Bearer " + likedInToken)
                .asJson();

        String imageUrl;

        // This is so ugly
        // Blame LinkedIn for this bs
        imageUrl = ((JSONObject) ((JSONArray) ((JSONObject) ((JSONArray) ((JSONObject) ((JSONObject) response.getBody()
                .getObject().get("profilePicture")).get("displayImage~")).get("elements")).get(2)).get("identifiers"))
                .get(0)).getString("identifier");

        return imageUrl;
    }
}
