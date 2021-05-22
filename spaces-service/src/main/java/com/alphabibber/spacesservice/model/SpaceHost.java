package com.alphabibber.spacesservice.model;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
@Table(name = "users_spaces_hosts")
public class SpaceHost {

    @Id
    @GeneratedValue(generator = "system-uuid")
    @GenericGenerator(name = "system-uuid", strategy = "uuid")
    @Column(name = "id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_host_id")
    User host;

    @ManyToOne
    @JoinColumn(name = "space_host_id")
    Space space;

    protected SpaceHost() {

    }

    public SpaceHost(User host, Space space) {
        this.host = host;
        this.space = space;
    }

    public User getHost() {
        return host;
    }

    public Space getSpace() {
        return space;
    }
}
