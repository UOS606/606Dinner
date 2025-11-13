package com.team606.mrdinner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 주문 내역 화면에서 사용하는 단일 아이템 정보 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponseDto {

    private String name;   // 예: "와인", "샴페인", "커피"
    private int qty;       // 수량
    private String unit;   // 예: "잔", "병"
}
