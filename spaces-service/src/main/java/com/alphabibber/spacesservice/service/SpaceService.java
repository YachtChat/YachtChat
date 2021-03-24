package com.alphabibber.spacesservice.service;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.repository.SpaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostFilter;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpaceService {

    @Autowired
    private SpaceRepository spaceRepository;

    public Space createSpace(Space space) {
        return spaceRepository.save(space);
    }

    public List<Space> getSpaces() {
        return spaceRepository.findAll();
    }

    public Space getSpaceById(String id) {
        return spaceRepository.findById(id).orElse(null);
    }

    public void deleteSpaceById(String id) {
        Space spaceToDelete = spaceRepository.getOne(id);
        spaceRepository.delete(spaceToDelete);
    }

}
