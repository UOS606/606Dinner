package com.team606.mrdinner.db.repository;

import com.team606.mrdinner.db.entity.IngredientOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IngredientOrderRepository extends JpaRepository<IngredientOrder, Long> {
}
