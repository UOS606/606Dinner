package com.team606.mrdinner.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="styles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Style {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true, length=20)
    private String code; // SIMPLE/GRAND/DELUXE/DEFAULT

    @Column(nullable=false, length=50)
    private String name;
}
