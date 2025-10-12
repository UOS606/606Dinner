package com.team606.mrdinner.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="order_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false) @JoinColumn(name="order_id")
    private Order order;

    @ManyToOne(optional=false) @JoinColumn(name="item_id")
    private Item item;

    @ManyToOne(optional=false) @JoinColumn(name="unit_id")
    private Unit unit;

    @Column(nullable=false)
    private Integer quantity;

    @Column(nullable=false)
    private Integer unitPrice;

    @Column(nullable=false)
    private Integer linePrice;
}
