package com.alphabibber.spacesservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
//    @GeneratedValue(generator = "system-uuid")
//    @GenericGenerator(name = "system-uuid", strategy = "uuid")
    @Column(name = "id")
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

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

    public User(String name) {
        this.name = name;
        this.hostSpaces = new HashSet<>();
        this.memberSpaces = new HashSet<>();
    }

    public User(String id, String name) {
        this.id = id;
        this.name = name;
        this.hostSpaces = new HashSet<>();
        this.memberSpaces = new HashSet<>();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
