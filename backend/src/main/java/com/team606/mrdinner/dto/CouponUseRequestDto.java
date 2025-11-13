package com.team606.mrdinner.dto;

import lombok.Data;

@Data
public class CouponUseRequestDto {
    private String action; // "use"
    private int usedCount;
}
