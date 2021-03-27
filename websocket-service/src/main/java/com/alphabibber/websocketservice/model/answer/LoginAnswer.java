package com.alphabibber.websocketservice.model.answer;

import com.alphabibber.websocketservice.model.User;

import java.util.List;

public class LoginAnswer extends Answer{
    boolean success;
    List<User> users;
    public LoginAnswer(boolean success, List<User> users){
        super("login");
        this.success = success;
        this.users = users;
    }
}
