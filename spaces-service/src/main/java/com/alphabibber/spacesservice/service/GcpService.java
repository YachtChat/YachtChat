package com.alphabibber.spacesservice.service;

import com.google.cloud.storage.*;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class GcpService {
    /**
     * Signing a URL requires Credentials which implement ServiceAccountSigner. These can be set
     * explicitly using the Storage.SignUrlOption.signWith(ServiceAccountSigner) option. If you don't,
     * you could also pass a service account signer to StorageOptions, i.e.
     * StorageOptions().newBuilder().setCredentials(ServiceAccountSignerCredentials). In this example,
     * neither of these options are used, which means the following code only works when the
     * credentials are defined via the environment variable GOOGLE_APPLICATION_CREDENTIALS, and those
     * credentials are authorized to sign a URL. See the documentation for Storage.signUrl for more
     * details.
     */
    private final String PROJECT_NAME = "central-hangar-308715";
    private final String BUCKET_NAME = "yacht.chat";

    public String getUrlForImage(){
        String uniqueID = UUID.randomUUID().toString();
        return generateV4GPutObjectSignedUrl(uniqueID);
    }

    private String generateV4GPutObjectSignedUrl(String objectName) throws StorageException {
        Storage storage = StorageOptions.newBuilder().setProjectId(PROJECT_NAME).build().getService();

        // Define Resource
        BlobInfo blobInfo = BlobInfo.newBuilder(BlobId.of(BUCKET_NAME, objectName)).build();

        // Generate Signed URL
        Map<String, String> extensionHeaders = new HashMap<>();
        extensionHeaders.put("Content-Type", "application/octet-stream");

        URL url =
                storage.signUrl(
                        blobInfo,
                        15,
                        TimeUnit.MINUTES,
                        Storage.SignUrlOption.httpMethod(HttpMethod.PUT),
                        Storage.SignUrlOption.withExtHeaders(extensionHeaders),
                        Storage.SignUrlOption.withV4Signature());
        return url.toString();
    }
}
