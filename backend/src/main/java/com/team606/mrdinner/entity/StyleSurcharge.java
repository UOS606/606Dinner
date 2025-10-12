package com.team606.mrdinner.entity;

import com.team606.mrdinner.entity.enums.SurchargeType;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="style_surcharges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StyleSurcharge {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional=false) @JoinColumn(name="style_id", unique = true)
    private Style style;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private SurchargeType surchargeType; // FLAT or RATE

    @Column(nullable=false)
    private Double value; // 정액(원) 또는 정율(%)
}
