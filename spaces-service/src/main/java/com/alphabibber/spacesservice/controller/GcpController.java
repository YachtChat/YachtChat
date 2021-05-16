package com.alphabibber.spacesservice.controller;

import com.alphabibber.spacesservice.service.GcpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path="/gcp")
public class GcpController extends SpringBootServletInitializer {
    @Autowired
    private GcpService gcpService;

    @GetMapping("/image")
    public String getUrlForUpload(){
        return gcpService.getUrlForImage();
    }
}
