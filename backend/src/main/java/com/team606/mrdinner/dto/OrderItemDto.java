package com.team606.mrdinner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 주문 항목을 프론트에 전달할 DTO
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDto {

    private String name;   // 품목 이름
    private int qty;       // 수량
    private String unit;   // 단위 (예: EA, BOX)
}
