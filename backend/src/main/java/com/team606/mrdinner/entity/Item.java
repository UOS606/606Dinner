package com.team606.mrdinner.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Item {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true, length=50)
    private String code;   // STEAK, SALAD, WINE, COFFEE, ...

    @Column(nullable=false, length=100)
    private String name;   // 한글 표기

    @Column
    private Integer basePrice;

    @Column
    private Boolean isActive;
}
