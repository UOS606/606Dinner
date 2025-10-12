package com.team606.mrdinner.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderResponseDto {
    private Long orderId;
    private String status;
    private String customerUsername;
    private String menuName;
    private String style;
    private int totalPrice;
    private List<Line> lines;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Line {
        private String itemName;
        private String unit;
        private int quantity;
        private int unitPrice;
        private int linePrice;
    }
}