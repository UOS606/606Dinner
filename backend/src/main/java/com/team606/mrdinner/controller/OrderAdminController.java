package com.team606.mrdinner.controller;

import com.team606.mrdinner.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/orders")
public class OrderAdminController {

    private final OrderService orderService;

    @PostMapping
    public void update(@RequestBody Map<String, Object> req) {

        String userId = (String) req.get("userId");
        String action = (String) req.get("action");

        Instant cartedTime = Instant.parse((String) req.get("cartedTime"));

        orderService.updateStatus(userId, cartedTime, action);
    }
}
