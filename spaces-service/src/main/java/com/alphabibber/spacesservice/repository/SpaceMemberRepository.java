package com.alphabibber.spacesservice.repository;

import com.alphabibber.spacesservice.model.SpaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpaceMemberRepository extends JpaRepository<SpaceMember, String> {

}