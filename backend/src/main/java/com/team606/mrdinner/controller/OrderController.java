package com.team606.mrdinner.controller;

import com.team606.mrdinner.dto.OrderRequestDto;
import com.team606.mrdinner.dto.OrderResponseDto;
import com.team606.mrdinner.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponseDto> create(@RequestBody OrderRequestDto req) {
        // 프론트의 req.id(username)는 신뢰하지 않고 JWT subject 사용
        return ResponseEntity.ok(orderService.createOrder(req));
    }
}
