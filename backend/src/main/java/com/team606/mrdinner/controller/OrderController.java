package com.team606.mrdinner.controller;

import com.team606.mrdinner.dto.CartOrderResponseDto;
import com.team606.mrdinner.dto.OrderBulkUpdateRequestDto;
import com.team606.mrdinner.dto.OrderRequestDto;
import com.team606.mrdinner.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * 장바구니 담기 (Cart.jsx: POST /api/orders)
     * - 프론트의 req.id(username)는 신뢰하지 않고, 서비스에서 JWT subject 사용
     */
    @PostMapping
    public ResponseEntity<CartOrderResponseDto> create(@RequestBody OrderRequestDto req) {
        return ResponseEntity.ok(orderService.createOrder(req));
    }

    /**
     * 장바구니 목록 조회 (Cart.jsx: GET /api/orders)
     */
    @GetMapping
    public ResponseEntity<List<CartOrderResponseDto>> list(Authentication auth) {
        return ResponseEntity.ok(orderService.getCartedOrders(auth.getName()));
    }

    /**
     * 장바구니 1건 삭제 (Cart.jsx: DELETE /api/orders)
     * 프론트는 body에 { id, cartedTime, action: "carted" } 를 보냄
     */
    @DeleteMapping
    public ResponseEntity<?> delete(@RequestBody DeleteCartRequest req, Authentication auth) {
        // 보안: 본인 여부 검증
        if (!auth.getName().equals(req.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "권한이 없습니다."));
        }
        orderService.deleteCartedOrder(auth.getName(), req.getCartedTime());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "삭제 완료"
        ));
    }

    /**
     * 장바구니 → 주문 확정 (Cart.jsx: PUT /api/orders)
     * body: { action:"ordered", orderedTime, orders:[ { cartedTime, isCouponUsed, address } ] }
     */
    @PutMapping
    public ResponseEntity<?> bulk(@RequestBody OrderBulkUpdateRequestDto body, Authentication auth) {
        orderService.markAsOrdered(auth.getName(), body);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "주문 처리 완료"
        ));
    }

    // ---- 요청 바디 DTO (DELETE용) ----
    public static class DeleteCartRequest {
        private String id;            // username
        private Instant cartedTime;   // ISO-8601
        private String action;        // "carted"

        public String getId() { return id; }
        public Instant getCartedTime() { return cartedTime; }
        public String getAction() { return action; }
        public void setId(String id) { this.id = id; }
        public void setCartedTime(Instant cartedTime) { this.cartedTime = cartedTime; }
        public void setAction(String action) { this.action = action; }
    }
}
