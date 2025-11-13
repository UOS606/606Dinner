package com.team606.mrdinner.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class CouponInfoResponseDto {
    private int unusedCouponCount;
    private int usedCouponCount;
}
