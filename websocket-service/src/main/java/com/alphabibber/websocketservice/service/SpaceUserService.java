package com.alphabibber.websocketservice.service;

import com.alphabibber.websocketservice.model.User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SpaceUserService {

    private final static Map<String, Map<String, User>> spaceMap = new ConcurrentHashMap<>(8);

    public Map<String, User> get(String s) {
        return spaceMap.get(s);
    }

    public void put(String s, Map<String, User> map) {
        spaceMap.put(s, map);
    }

    public Integer size(String spaceID) {
        if (spaceMap.containsKey(spaceID)) {
            System.out.println(spaceMap.get(spaceID));
            return spaceMap.get(spaceID).size();
        } else
            return 0;
    }
}
