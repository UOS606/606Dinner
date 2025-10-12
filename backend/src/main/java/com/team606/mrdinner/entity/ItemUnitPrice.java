package com.team606.mrdinner.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="item_unit_prices",
        uniqueConstraints=@UniqueConstraint(columnNames={"item_id","unit_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ItemUnitPrice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false) @JoinColumn(name="item_id")
    private Item item;

    @ManyToOne(optional=false) @JoinColumn(name="unit_id")
    private Unit unit;

    @Column(nullable=false)
    private Integer price; // 해당 단위 판매가
}
