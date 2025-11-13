package com.team606.mrdinner.dto;

import lombok.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDto {
    private String id;              // customerUsername 대체
    private String action;          // status → "carted"/"ordered"
    private LocalDateTime cartedTime;
    private LocalDateTime orderedTime;
    private LocalDateTime cookedTime;
    private LocalDateTime deliveredTime;     // 주문 담은 시각
    private String menuName;
    private String style;
    private String address;         // Cart.jsx 주문 시 prompt에 사용
    private List<OrderItemDto> items;
    private boolean isCouponUsed;
}
