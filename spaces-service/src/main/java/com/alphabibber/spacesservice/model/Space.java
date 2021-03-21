package com.alphabibber.spacesservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Set;

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

    @OneToMany(mappedBy = "space", cascade = CascadeType.REMOVE)
    @JsonIgnore // this annotation is needed to prevent infinite recursion when retrieving all spaces/users
    private Set<User> users;

}
