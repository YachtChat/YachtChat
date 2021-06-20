package chat.yacht.accountservice.controller;

import chat.yacht.accountservice.service.GcpService;
import chat.yacht.accountservice.service.KeycloakService;
import chat.yacht.accountservice.service.ProfileService;
import kong.unirest.HttpResponse;
import kong.unirest.JsonNode;
import org.apache.commons.io.FilenameUtils;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.ArrayList;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path="/account", produces = "application/json")
public class AccountController extends SpringBootServletInitializer{
    @Autowired
    private GcpService gcpService;

    @Autowired
    private KeycloakService keycloakService;

    @Autowired
    private ProfileService profileService;

    @GetMapping("/email")
    public ResponseEntity<String> getUserByEmail(@RequestParam String email) {
        HttpResponse<JsonNode> response = keycloakService.getUserByEmail(email);
        return new ResponseEntity<>(response.getBody().toString(), HttpStatus.valueOf(response.getStatus()));
    }

    @GetMapping("/")
    public ResponseEntity<String> getUser(Principal principal){
        String plainToken = ((KeycloakPrincipal) ((KeycloakAuthenticationToken) principal).getPrincipal()).getKeycloakSecurityContext().getTokenString();
        AccessToken token = ((KeycloakPrincipal) ((KeycloakAuthenticationToken) principal).getPrincipal()).getKeycloakSecurityContext().getToken();
        logger.info("Initial User Information was fetched for user " + token.getSubject());
        profileService.checkProfile(token, plainToken);

        String userId = token.getSubject();
        HttpResponse<JsonNode> response = keycloakService.getUserById(userId);
        if (response.getStatus() == 404){
            return new ResponseEntity<>("A User with id " + userId + " does not exist", HttpStatus.valueOf(404));
        }
        return new ResponseEntity<>(response.getBody().toString(), HttpStatus.valueOf(response.getStatus()));
    }

    @GetMapping("/{userId}/")
    public ResponseEntity<String> getUserById(@PathVariable String userId) {
        HttpResponse<JsonNode> response = keycloakService.getUserById(userId);
        if (response.getStatus() == 404){
            return new ResponseEntity<>("A User with id " + userId + " does not exist", HttpStatus.valueOf(404));
        }
        return new ResponseEntity<>(response.getBody().toString(), HttpStatus.valueOf(response.getStatus()));
    }

    @PostMapping("/userslist")
    public ResponseEntity<String> getUserListByIds(@RequestBody ArrayList<String> ids){
        ArrayList<String> answer = new ArrayList<>();
        ids.forEach(id -> {
            HttpResponse<JsonNode> currentResponse = keycloakService.getUserById(id);
            if (currentResponse.getStatus() != 404){
                answer.add(currentResponse.getBody().toString());
            }
        });
        return new ResponseEntity<>(String.valueOf(answer), HttpStatus.ACCEPTED);
    }

    @PostMapping("/image")
    public ResponseEntity<String> uploadImage(@RequestParam("image") MultipartFile file, Principal principal){
        AccessToken token = ((KeycloakPrincipal) ((KeycloakAuthenticationToken) principal).getPrincipal()).getKeycloakSecurityContext().getToken();
        // upload file to gcp
        String mimeType = file.getContentType();
        if(! mimeType.startsWith("image")){
            new ResponseEntity<>("The File that was provided was not an image", HttpStatus.BAD_REQUEST);
        }
//      TODO: resize image to smaller resolution
        String extension = FilenameUtils.getExtension(file.getOriginalFilename());
        String uniqueID = UUID.randomUUID() + "." + extension;
        String image_url;
        try{
            image_url = gcpService.uploadImageToBucket(uniqueID, file, extension);
        } catch(RuntimeException e){
            return new ResponseEntity<>("The image could not be uploaded to GCP Bucket", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        HttpResponse<JsonNode> response = keycloakService.updateUserImageById(image_url, token.getSubject());
        return new ResponseEntity<>("", HttpStatus.valueOf(response.getStatus()));
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateUser(@RequestBody String data, Principal principal){
        AccessToken token = ((KeycloakPrincipal) ((KeycloakAuthenticationToken) principal).getPrincipal()).getKeycloakSecurityContext().getToken();
        HttpResponse<JsonNode> ans = keycloakService.updateUserById(data, token.getSubject());
        return new ResponseEntity<>("", HttpStatus.valueOf(ans.getStatus()));
    }
}
