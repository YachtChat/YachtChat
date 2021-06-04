package com.alphabibber.spacesservice.repository;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.model.SpaceHost;
import com.alphabibber.spacesservice.model.SpaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface SpaceRepository extends JpaRepository<Space, String> {

    Set<Space> findAllByPublicAccessIsTrue();

    Set<Space> findAllBySpaceMembersContains(SpaceMember spaceMember);

    Set<Space> findAllBySpaceHostsContains(SpaceHost spaceHost);

    Set<Space> findAllByName(String name);

}
