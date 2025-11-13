package com.team606.mrdinner.service;

import com.team606.mrdinner.dto.*;
import com.team606.mrdinner.entity.*;
import com.team606.mrdinner.entity.enums.OrderStatus;
import com.team606.mrdinner.entity.enums.SurchargeType;
import com.team606.mrdinner.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.time.ZoneOffset;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CustomerRepository customerRepository;
    private final StyleRepository styleRepository;
    private final StyleSurchargeRepository styleSurchargeRepository;
    private final ItemRepository itemRepository;
    private final UnitRepository unitRepository;
    private final ItemUnitPriceRepository itemUnitPriceRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public CartOrderResponseDto createOrder(OrderRequestDto req) {
        // 1) JWT로 사용자 식별
        String username = resolveUsernameFromSecurityContext();
        Customer customer = customerRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다: " + username));

        // 2) 스타일
        String styleCode = normalizeStyleCode(req.getStyle()); // simple→SIMPLE
        Style style = styleRepository.findByCode(styleCode)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 스타일: " + req.getStyle()));

        // 3) 주문 헤더 생성
        Order order = Order.builder()
                .customer(customer)
                .style(style)
                .status(mapActionToStatus(req.getAction()))
                .menuName(req.getMenuName())
                .cartedTime(req.getCartedTime())
                .orderedTime(req.getOrderedTime())
                .cookedTime(req.getCookedTime())
                .deliveredTime(req.getDeliveredTime())
                .totalPrice(0)
                .build();

        int subtotal = 0;

        // 4) 라인 생성
        for (OrderItemRequestDto lineReq : req.getItems()) {
            if (lineReq.getQty() <= 0) continue;

            Item item = itemRepository.findByName(lineReq.getName())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 품목: " + lineReq.getName()));

            Unit unit = unitRepository.findByName(lineReq.getUnit())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 단위: " + lineReq.getUnit()));

            int unitPrice = itemUnitPriceRepository.findByItemAndUnit(item, unit)
                    .orElseThrow(() -> new IllegalStateException(
                            "해당 품목의 단위 가격 미정의: " + item.getName() + "/" + unit.getName()))
                    .getPrice();

            int linePrice = unitPrice * lineReq.getQty();
            subtotal += linePrice;

            OrderItem oi = OrderItem.builder()
                    .item(item)
                    .unit(unit)
                    .quantity(lineReq.getQty())
                    .unitPrice(unitPrice)
                    .linePrice(linePrice)
                    .build();
            order.addItem(oi);
        }

        // 5) 스타일 가산
        int total = applyStyleSurcharge(subtotal, style);
        order.setTotalPrice(total);

        // 6) 저장
        orderRepository.save(order);

        // 7) 응답 DTO
        if (order.getCartedTime() == null) {
            order.setCartedTime(OffsetDateTime.now(ZoneOffset.UTC));
        }
        return toCartDto(order);
    }

    private int applyStyleSurcharge(int subtotal, Style style) {
        return styleSurchargeRepository.findByStyle(style)
                .map(ss -> {
                    if (ss.getSurchargeType() == SurchargeType.FLAT) {
                        return subtotal + ss.getValue().intValue();
                    } else {
                        double rate = ss.getValue() / 100.0;
                        return subtotal + (int)Math.round(subtotal * rate);
                    }
                })
                .orElse(subtotal);
    }

    private String normalizeStyleCode(String style) {
        if (style == null) return "DEFAULT";
        String s = style.trim().toUpperCase(Locale.ROOT);
        return switch (s) {
            case "SIMPLE" -> "SIMPLE";
            case "GRAND" -> "GRAND";
            case "DELUXE" -> "DELUXE";
            default -> "DEFAULT";
        };
    }

    private OrderStatus mapActionToStatus(String action) {
        if ("carted".equalsIgnoreCase(action)) return OrderStatus.CARTED;
        return OrderStatus.RECEIVED;
    }

    private String resolveUsernameFromSecurityContext() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null)
            throw new IllegalStateException("인증 정보가 없습니다.");
        return auth.getName();
    }



    // 장바구니 목록 조회 (Cart.jsx: GET /api/orders)
    @Transactional(readOnly = true)
    public List<CartOrderResponseDto> getCartedOrders(String username) {
        return orderRepository.findByCustomerUsernameAndStatus(username, OrderStatus.CARTED)
                .stream()
                .sorted(Comparator.comparing(Order::getCartedTime).reversed())
                .map(this::toCartDto)
                .toList();
    }

    // 장바구니 1건 삭제 (Cart.jsx: DELETE /api/orders)
    @Transactional
    public void deleteCartedOrder(String username, Instant cartedTime) {
        Order order = orderRepository.findByCustomerUsernameAndCartedTime(username, cartedTime)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 없음"));
        if (order.getStatus() != OrderStatus.CARTED) {
            throw new IllegalStateException("carted 상태만 삭제 가능");
        }
        orderRepository.delete(order);
    }

    // 장바구니 → 주문 상태 전환 (Cart.jsx: PUT /api/orders)
    @Transactional
    public void markAsOrdered(String username, OrderBulkUpdateRequestDto body) {
        if (!"ordered".equalsIgnoreCase(body.getAction())) {
            throw new IllegalArgumentException("지원하지 않는 action");
        }
        for (OrderUpdateRequestDto upd : body.getOrders()) {
            Order order = orderRepository.findByCustomerUsernameAndCartedTime(username, upd.getCartedTime())
                    .orElseThrow(() -> new IllegalArgumentException("장바구니 없음"));

            order.setStatus(OrderStatus.ORDERED);            // 상태 전환
            order.setOrderedTime(
                    body.getOrderedTime() != null
                            ? body.getOrderedTime().atOffset(ZoneOffset.UTC)  // Instant → OffsetDateTime 변환
                            : OffsetDateTime.now(ZoneOffset.UTC)              // null이면 현재 시각
            );

            order.setCouponUsed(upd.isCouponUsed());         // 쿠폰 사용 여부
            if (upd.getAddress() != null && !upd.getAddress().isBlank()) {
                order.setAddress(upd.getAddress());          // 새 배송지 선택 시 반영
            }
        }
        // 트랜잭션 종료 시 flush
    }

    // 쿠폰 조회 (Cart.jsx: GET /api/coupons)
    @Transactional(readOnly = true)
    public CouponInfoResponseDto getMyCouponInfo(String username) {
        Customer c = customerRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));
        return new CouponInfoResponseDto(c.getUnusedCouponCount(), c.getUsedCouponCount());
    }

    // ★ 쿠폰 사용 (Cart.jsx: POST /api/coupons)
    @Transactional
    public void useCoupons(String username, int usedCount) {
        if (usedCount <= 0) return;
        Customer c = customerRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));
        if (c.getUnusedCouponCount() < usedCount) {
            throw new IllegalStateException("쿠폰 부족");
        }
        c.setUnusedCouponCount(c.getUnusedCouponCount() - usedCount);
        c.setUsedCouponCount(c.getUsedCouponCount() + usedCount);
    }

    // ----- 내부 변환기(엔티티 -> Cart 화면용 DTO) -----
    private CartOrderResponseDto toCartDto(Order o) {
        List<OrderItemDto> items = o.getItems().stream()
                .map(this::toItemDto)
                .toList();

        return CartOrderResponseDto.builder()
                .id(o.getCustomer().getUsername())                         // Cart.jsx는 id=username 사용
                .menuName(o.getMenuName())
                .style(o.getStyle().getCode())                              // Style이 엔티티면 코드만 주기
                .items(items)
                .action(o.getStatus() == OrderStatus.CARTED ? "carted" : "ordered")
                .cartedTime(o.getCartedTime() == null ? null : o.getCartedTime().toInstant())
                .address(o.getAddress())
                .couponApplied(false)                                       // 프론트 토글용(기본 false)
                .build();
    }

    private OrderItemDto toItemDto(OrderItem oi) {
        return OrderItemDto.builder()
                .name(oi.getItem().getName())
                .qty(oi.getQuantity())
                .unit(oi.getUnit().getName())
                .build();
    }

}
