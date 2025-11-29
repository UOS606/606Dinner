package com.team606.mrdinner.repository;

import com.team606.mrdinner.entity.IngredientOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IngredientOrderRepository extends JpaRepository<IngredientOrder, Long> {
}
