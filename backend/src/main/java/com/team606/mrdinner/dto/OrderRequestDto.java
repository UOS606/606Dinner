package com.team606.mrdinner.dto;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderRequestDto {
    private String id;          // 프론트는 username을 넣지만 서버는 JWT 사용
    private String menuName;    // "English" 등 (기록용)
    private String style;       // "simple" | "grand" | "deluxe" | "default"
    private String action;      // "carted" 등
    private String address;     // 프론트 null → 서버에서 채울 수 있음

    private OffsetDateTime cartedTime;
    private OffsetDateTime orderedTime;
    private OffsetDateTime cookedTime;
    private OffsetDateTime deliveredTime;

    private List<OrderItemRequestDto> items;
}