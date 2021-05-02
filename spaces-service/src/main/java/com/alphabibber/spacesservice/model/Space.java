package com.alphabibber.spacesservice.model;

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

    @ManyToMany(
            cascade = {
                    // If a space with actualized host information (in Java) is saved, then the user and her actualized
                    // hostSpaces information (which is modeled correctly in Java but not yet saved to the DB)
                    // is saved to the database as well
                    CascadeType.PERSIST,
                    // Merging means syncing the changes to the DB.
                    // Example: We add an existing user to the current space and save it. Then
                    // the existing user in the DB will be updated and the current space will
                    // be added to her hostSpaces.
                    CascadeType.MERGE
            }
    )
    @JoinTable(
        name = "users_spaces_hosts",
        // The foreign key columns of the join table which reference the primary table of the entity owning
        // the association. (I.e. the owning side of the association).
        joinColumns = @JoinColumn(name = "space_host_id", insertable = false, updatable = false),
        // The foreign key columns of the join table which reference the primary table of the entity that does
        // not own the association. (I.e. the inverse side of the association).
        inverseJoinColumns = @JoinColumn(name = "user_host_id", insertable = false, updatable = false)
    )
    private List<User> hosts;

    @ManyToMany(
            cascade = {
                    CascadeType.PERSIST,
                    CascadeType.MERGE
            }
    )
    @JoinTable(
        name = "users_spaces_participants",
        joinColumns = @JoinColumn(name = "space_participant_id", insertable = false, updatable = false),
        inverseJoinColumns = @JoinColumn(name = "user_participant_id", insertable = false, updatable = false)
    )
    private List<User> participants;

    protected Space() {

    }

    public Space(String name) {
        this.name = name;
        this.hosts = new ArrayList<>();
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

    public List<User> getHosts() {
        return hosts;
    }

    public void setHosts(List<User> owners) {
        this.hosts = owners;
    }

    public void addHost(User host) {
        this.hosts.add(host);
    }

    public void removeHost(User host) {
        this.hosts.remove(host);
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

    public void removeParticipant(User participant) {
        this.participants.remove(participant);
    }

    public List<User> getAllUsers() {
        List<User> result = new ArrayList<>();
        result.addAll(this.hosts);
        result.addAll(this.participants);
        return result;
    }
}
