package chat.yacht.accountservice.controller;

import chat.yacht.accountservice.service.GcpService;
import chat.yacht.accountservice.service.KeycloakService;
import kong.unirest.HttpResponse;
import kong.unirest.JsonNode;
import kong.unirest.json.JSONObject;
import org.apache.commons.io.FilenameUtils;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.ArrayList;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path="/account")
public class AccountController extends SpringBootServletInitializer{
    @Autowired
    private GcpService gcpService;

    @Autowired
    private KeycloakService keycloakService;

    @GetMapping("/email")
    public ResponseEntity<String> getUserByEmail(@RequestParam String email) {
        HttpResponse<JsonNode> response = keycloakService.getUserByEmail(email);
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

    @GetMapping("/userslist")
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
            new ResponseEntity<>("The File tha was provided was not an image", HttpStatus.BAD_REQUEST);
        }
//      TODO: resize image to smaller resolution
        String extension = FilenameUtils.getExtension(file.getOriginalFilename());
        String uniqueID = UUID.randomUUID() + "." + extension;
        String image_url = gcpService.uploadImageToBucket(uniqueID, file);
        HttpResponse<JsonNode> response = keycloakService.updateUserImageById(image_url, token.getSubject());
        return new ResponseEntity<>("", HttpStatus.valueOf(response.getStatus()));
    }

    @PutMapping("/")
    public ResponseEntity<String> updateUser(@RequestBody String data, Principal principal){
        AccessToken token = ((KeycloakPrincipal) ((KeycloakAuthenticationToken) principal).getPrincipal()).getKeycloakSecurityContext().getToken();
        HttpResponse<JsonNode> ans = keycloakService.updateUserById(data, token.getSubject());
        return new ResponseEntity<>("", HttpStatus.valueOf(ans.getStatus()));
    }
}
