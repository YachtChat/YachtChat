package com.alphabibber.spacesservice.repository;

import com.alphabibber.spacesservice.model.Space;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpaceRepository extends JpaRepository<Space, String> {

}
