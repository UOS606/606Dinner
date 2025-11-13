package com.team606.mrdinner.dto;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class OrderBulkUpdateRequestDto {
    private String action;              // "ordered"
    private Instant orderedTime;        // ISO-8601
    private List<OrderUpdateRequestDto> orders;
}
