package com.team606.mrdinner.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="units")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Unit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length=20)
    private String code;  // CUP/BOTTLE/POT/PLATE/SERVING/PIECE

    @Column(nullable=false, length=20)
    private String name;  // 잔/병/포트/접시/인분/개
}
