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
    @Column(nullable=false, length = 20)
    private OrderStatus status;

    private String menuName; // 기록용

    private OffsetDateTime cartedTime;
    private OffsetDateTime orderedTime;
    private OffsetDateTime cookedTime;
    private OffsetDateTime deliveredTime;

    @Column(nullable=false)
    private Integer totalPrice;

    /** 새로 추가된 부분: 쿠폰 사용 여부 */
    @Column(nullable = false)
    @lombok.Builder.Default
    private boolean couponUsed = false;

    /** 주문 시점 배송지(기본 주소 또는 입력 주소) */
    @Column(length = 255)
    private String address;

    @OneToMany(mappedBy="order", cascade=CascadeType.ALL, orphanRemoval=true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    public void addItem(OrderItem oi) { items.add(oi); oi.setOrder(this); }
}
