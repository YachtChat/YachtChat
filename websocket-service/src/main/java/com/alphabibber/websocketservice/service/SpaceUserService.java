package com.alphabibber.websocketservice.service;

import com.alphabibber.websocketservice.model.Position;
import com.alphabibber.websocketservice.model.User;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SpaceUserService {

    private final static Map<String, Map<String, User>> spaceMap = new ConcurrentHashMap<>(8);

    public Map<String, User> get(String s) {
        return spaceMap.get(s);
    }

    public Collection<User> getUserSet(String spaceID) {
        return spaceMap.get(spaceID).values();
    }

    public boolean isUserPartOfSpace(String spaceID, String userID) {
        return spaceMap.get(spaceID).containsKey(userID);
    }

    public void put(String s, Map<String, User> map) {
        spaceMap.put(s, map);
    }

    public User setUserPosition(String spaceID, String sessionId, Position position) {
        User userToUpdate = spaceMap.get(spaceID).get(sessionId);
        userToUpdate.setPosition(position);
        putUserInSpace(spaceID, userToUpdate, sessionId);
        return userToUpdate;
    }

    public User getUser(String spaceID, String sessionId) {
        return spaceMap.get(spaceID).get(sessionId);
    }

    public User getUserWithUserId(String spaceId, String userId) {
        for (User user: getUserSet(spaceId)) {
            if (user.getId().equals(userId)) return user;
        }
        throw new IllegalArgumentException("User with userId " + userId + " not found in space " + spaceId);
    }

    public User putUserInSpace(String spaceID, User user, String sessionId) {
        spaceMap.get(spaceID).put(sessionId, user);
        return user;
    }

    public User removeUserFromSpace(String spaceID, String sessionId) {
        User user = spaceMap.get(spaceID).get(sessionId);
        spaceMap.get(spaceID).remove(sessionId);
        return user;
    }

    public boolean isUserInSpace(String spaceID, String sessionId) {
        return spaceMap.get(spaceID).containsKey(sessionId);
    }

    public Integer size(String spaceID) {
        if (spaceMap.containsKey(spaceID)) {
            return spaceMap.get(spaceID).size();
        } else
            return 0;
    }

    public Integer sessions() {
        int sessions = 0;
        for (Map<String, User> s : spaceMap.values()) {
            sessions += s.size();
        }
        return sessions;
    }
}
