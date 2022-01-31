package com.alphabibber.websocketservice.model.answer;

import com.alphabibber.websocketservice.model.User;
import com.google.gson.annotations.Expose;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

public class LoginAnswer extends Answer{
    @Expose
    boolean success;
    @Expose
    Collection<User> users;
    @Expose
    String id;
    public LoginAnswer(boolean success, Collection<User> users, String id){
        super("login");
        this.success = success;
        this.id = id;
        this.users = users;
    }
}
