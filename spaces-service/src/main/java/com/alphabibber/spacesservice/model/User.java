package com.alphabibber.spacesservice.model;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(generator = "system-uuid")
    @GenericGenerator(name = "system-uuid", strategy = "uuid")
    @Column(name = "id")
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @ManyToMany(
            // adding "mappedBy" here makes the Space (not the User!) the owner of the relation between hosts
            // and spaces. This means that the cascading operations by Space to the association will be propagated
            // towards User and not the other way around, e.g. when persisting to the DB.
            // Changes made to the User entry directly will still be propagated to the Space and their relationship,
            // e.g. when a user is deleted the space will adjust its hosts/participants list as well (because of
            // the merge cascade type).
            mappedBy = "hosts",
            cascade = {
                    CascadeType.MERGE,
                    CascadeType.PERSIST
            }
    )
    private List<Space> hostSpaces;

    @ManyToMany(
            mappedBy = "participants",
            cascade = {
                    CascadeType.MERGE,
                    CascadeType.PERSIST
            }
    )
    private List<Space> participantSpaces;

    protected User() {

    }

    public User(String name) {
        this.name = name;
        this.hostSpaces = new ArrayList<>();
        this.participantSpaces = new ArrayList<>();
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

    public void addParticipantSpace(Space space) {
        this.participantSpaces.add(space);
    }

    public void removeParticipantSpace(Space space) {
        this.participantSpaces.remove(space);
    }

    public void addHostSpace(Space space) {
        this.hostSpaces.add(space);
    }
}
