package com.team606.mrdinner.dto;

import lombok.*;
import java.time.Instant;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartOrderResponseDto {
    private String id;                 // = customerUsername
    private String menuName;
    private String style;
    private List<OrderItemDto> items;  // name, qty, unit
    private String action;             // "carted" | "ordered"
    private Instant cartedTime;        // ISO-8601로 직렬화됨
    private String address;
    private Boolean couponApplied;     // 기본 false (프론트 토글용)
}
