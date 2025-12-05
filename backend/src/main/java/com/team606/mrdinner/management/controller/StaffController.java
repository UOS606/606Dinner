package com.team606.mrdinner.management.controller;

import com.team606.mrdinner.management.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/staffs")
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    public Map<String, Map<String, String>> list() {
        return staffService.list();
    }

    @PostMapping
    public void assign(@RequestBody Map<String, String> req) {
        String type = req.get("type");
        String staffName = req.get("staffName");

        if (Boolean.parseBoolean(req.getOrDefault("unassign", "false"))) {
            staffService.unassign(type, staffName);
        } else {
            staffService.assign(type, staffName, req.get("userId"));
        }
    }
}
