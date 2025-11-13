package com.team606.mrdinner.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class OrderUpdateRequestDto {
    private Instant cartedTime;
    private boolean isCouponUsed;
    private String address; // 새 주소(입력이 없으면 기존 주소 유지)
}
