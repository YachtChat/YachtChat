package com.alphabibber.spacesservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "id")
    private String id;

    @OneToMany(
            mappedBy = "host",
            cascade = {
                    CascadeType.REMOVE
            }
    )
    @JsonIgnore
    private Set<SpaceHost> hostSpaces;

    @OneToMany(
            mappedBy = "member",
            cascade = {
                    CascadeType.REMOVE
            }
    )
    @JsonIgnore
    private Set<SpaceMember> memberSpaces;

    protected User() {

    }

    public User(String id) {
        this.id = id;
        this.hostSpaces = new HashSet<>();
        this.memberSpaces = new HashSet<>();
    }

    public String getId() {
        return id;
    }

    public void addHostSpace(SpaceHost spaceHost) {
        hostSpaces.add(spaceHost);
    }

    public void removeHostSpace(SpaceHost spaceHost) {
        hostSpaces.remove(spaceHost);
    }

    public void addMemberSpace(SpaceMember spaceMember) {
        memberSpaces.add(spaceMember);
    }

    public void removeMemberSpace(SpaceMember spaceMember) {
        memberSpaces.remove(spaceMember);
    }

    public Set<SpaceHost> getHostSpaces() {
        return hostSpaces;
    }

    public Set<SpaceMember> getMemberSpaces() {
        return memberSpaces;
    }
}
