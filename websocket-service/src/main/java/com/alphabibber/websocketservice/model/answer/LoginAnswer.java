package com.alphabibber.websocketservice.model.answer;

import com.alphabibber.websocketservice.model.User;
import com.google.gson.annotations.Expose;

import java.util.List;

public class LoginAnswer extends Answer{
    @Expose
    boolean success;
    @Expose
    List<User> users;
    @Expose
    String id;
    public LoginAnswer(boolean success, List<User> users, String id){
        super("login");
        this.success = success;
        this.id = id;
        this.users = users;
    }
}
