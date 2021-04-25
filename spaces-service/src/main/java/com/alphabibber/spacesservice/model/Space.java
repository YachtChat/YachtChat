package com.alphabibber.spacesservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

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

    @ManyToMany
    private List<User> owners;

    @ManyToMany
    private List<User> participants;

    protected Space() {

    }

    public Space(String name) {
        this.name = name;
        this.owners = new ArrayList<>();
        this.participants = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<User> getOwners() {
        return owners;
    }

    public void setOwners(List<User> owners) {
        this.owners = owners;
    }

    public void addOwner(User owner) {
        this.owners.add(owner);
    }

    public List<User> getParticipants() {
        return participants;
    }

    public void setParticipants(List<User> participants) {
        this.participants = participants;
    }

    public void addParticipant(User participant) {
        this.participants.add(participant);
    }

    public List<User> getAllUsers() {
        List<User> result = new ArrayList<>();
        result.addAll(this.owners);
        result.addAll(this.participants);
        return result;
    }
}
