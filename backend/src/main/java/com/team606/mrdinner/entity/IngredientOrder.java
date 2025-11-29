package com.team606.mrdinner.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ingredient_orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IngredientOrder {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private OffsetDateTime orderDate;

    @Column(nullable=false)
    private String state; // "ordered" | "applied"

    @OneToMany(mappedBy = "ingredientOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<IngredientOrderItem> items = new ArrayList<>();

    public void addItem(IngredientOrderItem item) {
        items.add(item);
        item.setIngredientOrder(this);
    }
}
