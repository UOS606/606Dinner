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
    public OrderResponseDto createOrder(OrderRequestDto req) {
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
        return OrderResponseDto.builder()
                .orderId(order.getId())
                .status(order.getStatus().name())
                .customerUsername(customer.getUsername())
                .menuName(order.getMenuName())
                .style(style.getCode())
                .totalPrice(order.getTotalPrice())
                .lines(order.getItems().stream().map(oi ->
                        OrderResponseDto.Line.builder()
                                .itemName(oi.getItem().getName())
                                .unit(oi.getUnit().getName())
                                .quantity(oi.getQuantity())
                                .unitPrice(oi.getUnitPrice())
                                .linePrice(oi.getLinePrice())
                                .build()
                ).toList())
                .build();
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
}
