package com.alphabibber.spacesservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.SortedSet;

@Entity
@Table(name = "spaces")
public class Space {

    @Id
    @GeneratedValue(generator = "system-uuid")
    @GenericGenerator(name = "system-uuid", strategy = "uuid")
    @Column(name = "id")
    private String id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner")
    private User owner;

    @OneToMany(mappedBy = "space", cascade = CascadeType.REMOVE)
    @JsonIgnore // this annotation is needed to prevent infinite recursion when retrieving all spaces/users
    private List<User> users;

    protected Space() {

    }

    public Space(String name) {
        this.name = name;
        this.setUsers(new ArrayList<>());
    }

    public Space(String name, User owner) {
        this.name = name;
        this.owner = owner;
        this.setUsers(new ArrayList<>());
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

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public void addUser(User user) {
        this.users.add(user);
    }

    public void removeUser(User user) {
        this.users.remove(user);
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Boolean canUserSeeSpace(String userId) {
        return (this.getOwner() == null || this.getOwner().getId().equals(userId));
    }
}
