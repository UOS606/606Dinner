package com.team606.mrdinner.db.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ingredients")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ingredient {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String name; // "steak", "wine" 등

    @Column(nullable = false)
    private Double quantity; // 현재 재고량

    @Column(nullable = false, length = 20)
    private String unit; // "개", "잔", "병"
}
