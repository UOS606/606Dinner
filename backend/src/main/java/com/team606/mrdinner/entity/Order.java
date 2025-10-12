package com.team606.mrdinner.entity;

import com.team606.mrdinner.entity.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name="orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false) @JoinColumn(name="customer_id")
    private Customer customer;

    @ManyToOne(optional=false) @JoinColumn(name="style_id")
    private Style style;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private OrderStatus status;

    private String menuName; // 기록용

    private OffsetDateTime cartedTime;
    private OffsetDateTime orderedTime;
    private OffsetDateTime cookedTime;
    private OffsetDateTime deliveredTime;

    @Column(nullable=false)
    private Integer totalPrice;

    @OneToMany(mappedBy="order", cascade=CascadeType.ALL, orphanRemoval=true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    public void addItem(OrderItem oi) { items.add(oi); oi.setOrder(this); }
}
