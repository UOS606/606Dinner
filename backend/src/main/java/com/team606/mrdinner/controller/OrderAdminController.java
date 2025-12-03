package com.team606.mrdinner.controller;

import com.team606.mrdinner.dto.OrderResponseDto;
import com.team606.mrdinner.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/orders")
public class OrderAdminController {

    private final OrderService orderService;

    /**
     * 어드민용 전체 주문 조회
     * Assign.jsx 에서 GET /api/admin/orders/all 로 호출
     */
    @GetMapping("/all")
    public List<OrderResponseDto> getAllOrders() {
        return orderService.getAllOrdersForAdmin();
    }

    /**
     * 어드민용 주문 상태 변경
     * Assign.jsx 에서 POST /api/admin/orders 로 호출
     *
     * body: {
     *   "userId": "주문PK(문자열)",
     *   "cartedTime": "2025-11-30T03:40:00Z",
     *   "action": "cooking" | "cooked" | "delivering" | "delivered"
     * }
     */
    @PostMapping
    public void update(@RequestBody Map<String, Object> req) {
        String userId = (String) req.get("userId");
        String action = (String) req.get("action");

        Instant cartedTime = null;
        Object cartedTimeRaw = req.get("cartedTime");
        if (cartedTimeRaw instanceof String s && !s.isBlank()) {
            cartedTime = Instant.parse(s); // OrderService.updateStatus 에서는 현재 사용하지 않음
        }

        orderService.updateStatus(userId, cartedTime, action);
    }
}
