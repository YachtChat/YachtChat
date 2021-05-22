package com.alphabibber.spacesservice.repository;

import com.alphabibber.spacesservice.model.SpaceHost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpaceHostRepository extends JpaRepository<SpaceHost, String> {

}
