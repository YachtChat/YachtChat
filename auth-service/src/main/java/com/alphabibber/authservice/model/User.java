package com.alphabibber.authservice.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "sub", unique = true)
    private String sub;

    @Column(name = "refresh_token")
    private String refreshToken;

    protected User() {

    }

    public User(String sub, String refreshToken) {
        this.sub = sub;
        this.refreshToken = refreshToken;
    }

    public String getSub() {
        return sub;
    }

    public void setSub(String sub) {
        this.sub = sub;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
