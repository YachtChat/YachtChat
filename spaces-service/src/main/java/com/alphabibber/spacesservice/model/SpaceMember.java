package com.alphabibber.spacesservice.model;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
@Table(name = "users_spaces_members")
public class SpaceMember {

    @Id
    @GeneratedValue(generator = "system-uuid")
    @GenericGenerator(name = "system-uuid", strategy = "uuid")
    @Column(name = "id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_member_id")
    User member;

    @ManyToOne
    @JoinColumn(name = "space_member_id")
    Space space;

    protected SpaceMember() {

    }

    public SpaceMember(User member, Space space) {
        this.member = member;
        this.space = space;
    }

    public User getMember() {
        return member;
    }

    public Space getSpace() {
        return space;
    }
}
