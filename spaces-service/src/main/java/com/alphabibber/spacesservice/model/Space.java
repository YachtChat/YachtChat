package com.alphabibber.spacesservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "spaces")
public class Space {

    @Id
    @GeneratedValue(generator = "system-uuid")
    @GenericGenerator(name = "system-uuid", strategy = "uuid")
    @Column(name = "id")
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "public_access", nullable = false)
    private Boolean publicAccess;

    @Column(name="large_space", nullable = false)
    private Boolean largeSpace;

    @OneToMany(
            mappedBy = "space",
            cascade = {
                    CascadeType.REMOVE
            }
    )
    @JsonIgnore
    private Set<SpaceHost> spaceHosts;

    @OneToMany(
            mappedBy = "space",
            cascade = {
                    CascadeType.REMOVE
            }
    )
    @JsonIgnore
    private Set<SpaceMember> spaceMembers;

    protected Space() {

    }

    public Space(String name) {
        this.name = name;
        this.spaceHosts = new HashSet<>();
        this.spaceMembers = new HashSet<>();
        this.publicAccess = false;
    }

    public Space(String name, boolean isLarge) {
        this.name = name;
        this.spaceHosts = new HashSet<>();
        this.spaceMembers = new HashSet<>();
        this.publicAccess = false;
        this.largeSpace = isLarge;
    }

    public String getId() {
        return id;
    }

    public Boolean isPublic() {
        return publicAccess;
    }

    public Boolean isLargeSpace() { return this.largeSpace; }

    public void setPublicAccess(Boolean publicAccess) {
        this.publicAccess = publicAccess;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<SpaceHost> getSpaceHosts() {
        return spaceHosts;
    }

    public void setSpaceHosts(Set<SpaceHost> spaceHosts) {
        this.spaceHosts = spaceHosts;
    }

    public void addSpaceHost(SpaceHost spaceHost) {
        spaceHosts.add(spaceHost);
    }

    public void removeSpaceHost(SpaceHost spaceHost) {
        spaceHosts.remove(spaceHost);
    }

    public Set<SpaceMember> getSpaceMembers() {
        return spaceMembers;
    }

    public void setSpaceMembers(Set<SpaceMember> spaceMembers) {
        this.spaceMembers = spaceMembers;
    }

    public void addSpaceMember(SpaceMember spaceMember) {
        spaceMembers.add(spaceMember);
    }

    public void removeSpaceMember(SpaceMember spaceMember) {
        spaceMembers.remove(spaceMember);
    }

    @JsonIgnore
    public Set<User> getAllUsers() {
        Set<User> result = new HashSet<>();

        spaceMembers.forEach(spaceMember -> result.add(spaceMember.member));
        spaceHosts.forEach(spaceHost -> result.add(spaceHost.host));

        return result;
    }

    public void setLargeSpace(boolean largeSpace) { this.largeSpace = largeSpace; }

}
