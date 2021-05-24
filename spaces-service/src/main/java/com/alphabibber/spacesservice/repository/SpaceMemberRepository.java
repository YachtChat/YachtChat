package com.alphabibber.spacesservice.repository;

import com.alphabibber.spacesservice.model.Space;
import com.alphabibber.spacesservice.model.SpaceMember;
import com.alphabibber.spacesservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpaceMemberRepository extends JpaRepository<SpaceMember, String> {

    SpaceMember findSpaceMemberBySpaceIsAndMemberIs(Space space, User member);

}