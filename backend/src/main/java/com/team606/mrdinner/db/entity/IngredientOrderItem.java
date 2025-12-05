package com.team606.mrdinner.db.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;   // ✅ 추가
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ingredient_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngredientOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "ingredient_order_id")
    @JsonIgnore   // ✅ 역방향 참조는 JSON 에서 제외해서 무한 루프 차단
    private IngredientOrder ingredientOrder;

    @Column(nullable = false)
    private String item; // 예: "steak"

    @Column(nullable = false)
    private Double quantity;
}
