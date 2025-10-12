package com.team606.mrdinner.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItemRequestDto {
    private String name; // "스테이크", "와인", ...
    private int qty;     // 0 이상
    private String unit; // "접시","인분","개","잔","병","포트"
}