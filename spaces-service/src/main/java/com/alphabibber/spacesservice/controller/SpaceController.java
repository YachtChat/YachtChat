package com.alphabibber.spacesservice.controller;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.service.SpaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path="/spaces")
public class SpaceController extends SpringBootServletInitializer {

    @Autowired
    private SpaceService spaceService;

    @GetMapping()
    public List<Space> getAllSpaces() {
        return spaceService.getSpaces();
    }

}
