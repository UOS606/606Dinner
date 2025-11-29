package com.team606.mrdinner.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class StaffService {

    // type -> staffName -> userId
    private final Map<String, Map<String, String>> staffMap = new HashMap<>();

    public StaffService() {
        staffMap.put("cook", new HashMap<>());
        staffMap.put("delivery", new HashMap<>());
    }

    public Map<String, Map<String, String>> list() {
        return staffMap;
    }

    public void assign(String type, String staffName, String userId) {
        staffMap.get(type).put(staffName, userId);
    }

    public void unassign(String type, String staffName) {
        staffMap.get(type).remove(staffName);
    }
}
