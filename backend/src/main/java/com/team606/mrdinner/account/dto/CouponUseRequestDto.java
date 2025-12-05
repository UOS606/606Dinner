package com.team606.mrdinner.account.dto;

import lombok.Data;

@Data
public class CouponUseRequestDto {
    private String action; // "use"
    private int usedCount;
}
