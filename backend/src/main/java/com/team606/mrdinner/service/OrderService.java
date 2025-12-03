package com.team606.mrdinner.service;

import com.team606.mrdinner.dto.*;
import com.team606.mrdinner.entity.*;
import com.team606.mrdinner.entity.enums.OrderStatus;
import com.team606.mrdinner.entity.enums.SurchargeType;
import com.team606.mrdinner.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
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

    // ======================= 주문 생성 (장바구니/바로 주문 공통) =======================

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
                        return subtotal + (int) Math.round(subtotal * rate);
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
        // 장바구니가 아닌 경우 기본은 주문 접수 상태
        return OrderStatus.ORDERED;
    }

    private String resolveUsernameFromSecurityContext() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null)
            throw new IllegalStateException("인증 정보가 없습니다.");
        return auth.getName();
    }

    // ======================= Order → 프론트 액션 문자열 변환 =======================

    /**
     * DB의 OrderStatus + 시간 필드들을 조합해서
     * 프론트에서 쓰는 action 문자열로 변환
     *
     * ordered     : 고객이 주문만 넣은 상태
     * cooking     : 조리 배정 후, 조리 중
     * cooked      : 조리 완료, 배달 배정 대기
     * delivering  : 배달 중
     * delivered   : 배달 완료
     */
    private String toActionString(Order o) {
        OrderStatus status = o.getStatus();
        if (status == null) return "checking";

        switch (status) {
            case CARTED:
                return "carted";

            case ORDERED:
                // 아직 조리/배달 배정 전
                return "ordered";

            case RECEIVED:
                // RECEIVED 는 조리/배달 과정에서만 사용
                if (o.getCookedTime() == null) {
                    // 조리 시작만 된 상태
                    return "cooking";
                }
                if (o.getDeliveredTime() == null) {
                    // 조리는 끝났고, 배달 중
                    return "delivering";
                }
                return "delivered";

            case COOKED:
                // 조리 완료, 배달 배정 전
                return "cooked";

            case DELIVERED:
                return "delivered";

            case CANCELLED:
                return "cancelled";

            default:
                return "checking";
        }
    }

    // ======================= 주문 내역 조회 (OrderHistory.jsx: GET /api/orders) =======================

    /**
     * 로그인한 사용자의 전체 주문 내역 조회
     * - OrderHistory.jsx가 기대하는 형태/정렬 기준에 맞춰 반환한다.
     */
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMyOrders(String username) {
        Customer customer = customerRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다: " + username));

        return orderRepository.findByCustomer(customer).stream()
                // JS 쪽 정렬: orderedTime 내림차순, 같으면 cartedTime 내림차순
                .sorted((a, b) -> {
                    long aOrdered = toEpochMillis(a.getOrderedTime());
                    long bOrdered = toEpochMillis(b.getOrderedTime());
                    long aCarted = toEpochMillis(a.getCartedTime());
                    long bCarted = toEpochMillis(b.getCartedTime());

                    if (bOrdered != aOrdered) {
                        return Long.compare(bOrdered, aOrdered); // orderedTime desc
                    }
                    return Long.compare(bCarted, aCarted);       // cartedTime desc
                })
                .map(this::toOrderResponseDto)
                .toList();
    }

    private long toEpochMillis(OffsetDateTime time) {
        if (time == null) return 0L;
        return time.toInstant().toEpochMilli();
    }

    private OrderResponseDto toOrderResponseDto(Order o) {
        String styleCode = (o.getStyle() != null && o.getStyle().getCode() != null)
                ? o.getStyle().getCode()
                : "DEFAULT";

        String action = toActionString(o);

        List<OrderItemDto> items = o.getItems().stream()
                .map(this::toItemDto)
                .toList();

        return OrderResponseDto.builder()
                .id(String.valueOf(o.getId()))
                .menuName(o.getMenuName())
                .style(styleCode)
                .action(action)
                // OffsetDateTime -> LocalDateTime 변환
                .cartedTime(o.getCartedTime() == null ? null : o.getCartedTime().toLocalDateTime())
                .orderedTime(o.getOrderedTime() == null ? null : o.getOrderedTime().toLocalDateTime())
                .cookedTime(o.getCookedTime() == null ? null : o.getCookedTime().toLocalDateTime())
                .deliveredTime(o.getDeliveredTime() == null ? null : o.getDeliveredTime().toLocalDateTime())
                .address(o.getAddress())
                .isCouponUsed(o.isCouponUsed())
                .items(items)
                .build();
    }

    // ======================= 장바구니 관련 API (Cart.jsx) =======================

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
        OffsetDateTime cartedTimeUtc = cartedTime.atOffset(ZoneOffset.UTC);   // ★ 변환

        Order order = orderRepository
                .findByCustomerUsernameAndCartedTime(username, cartedTimeUtc)
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
            OffsetDateTime cartedTimeUtc = upd.getCartedTime().atOffset(ZoneOffset.UTC); // ★ 변환

            Order order = orderRepository
                    .findByCustomerUsernameAndCartedTime(username, cartedTimeUtc)
                    .orElseThrow(() -> new IllegalArgumentException("장바구니 없음"));

            order.setStatus(OrderStatus.ORDERED);
            order.setOrderedTime(
                    body.getOrderedTime() != null
                            ? body.getOrderedTime().atOffset(ZoneOffset.UTC)
                            : OffsetDateTime.now(ZoneOffset.UTC)
            );

            order.setCouponUsed(upd.isCouponUsed());
            if (upd.getAddress() != null && !upd.getAddress().isBlank()) {
                order.setAddress(upd.getAddress());
            }
        }
        // 트랜잭션 종료 시 flush
    }

    // ======================= 쿠폰 관련 API =======================

    // 쿠폰 조회 (Cart.jsx: GET /api/coupons)
    @Transactional(readOnly = true)
    public CouponInfoResponseDto getMyCouponInfo(String username) {
        Customer c = customerRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));
        return new CouponInfoResponseDto(c.getUnusedCouponCount(), c.getUsedCouponCount());
    }

    // 쿠폰 사용 (Cart.jsx: POST /api/coupons)
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

    // ======================= 내부 변환기 =======================

    // Cart 화면용 DTO 변환
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

    // 단일 아이템 DTO 변환 (Cart/History 공용)
    private OrderItemDto toItemDto(OrderItem oi) {
        return OrderItemDto.builder()
                .name(oi.getItem().getName())
                .qty(oi.getQuantity())
                .unit(oi.getUnit().getName())
                .build();
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getAllOrdersForAdmin() {
        return orderRepository.findAll().stream()
                .map(this::toOrderResponseDto)
                .toList();
    }

    @Transactional
    public void updateStatus(String orderIdStr, Instant cartedTime, String action) {

        // 프론트에서 오는 userId(사실은 주문 PK)를 Long으로 변환
        Long orderId;
        try {
            orderId = Long.parseLong(orderIdStr);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("잘못된 주문 ID: " + orderIdStr);
        }

        // cartedTime 은 지금은 쓰지 않고, orderId 기준으로만 조회
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문 없음"));

        switch (action) {
            case "cooking":
                // 조리 시작
                order.setStatus(OrderStatus.RECEIVED);
                break;

            case "cooked":
                // 조리 완료
                order.setStatus(OrderStatus.COOKED);
                order.setCookedTime(OffsetDateTime.now(ZoneOffset.UTC));
                break;

            case "delivering":
                // 배달 시작 (조리 완료는 된 상태여야 함)
                order.setStatus(OrderStatus.RECEIVED);
                if (order.getCookedTime() == null) {
                    order.setCookedTime(OffsetDateTime.now(ZoneOffset.UTC));
                }
                break;

            case "delivered":
                // 배달 완료
                order.setStatus(OrderStatus.DELIVERED);
                order.setDeliveredTime(OffsetDateTime.now(ZoneOffset.UTC));
                break;
        }
    }

}
