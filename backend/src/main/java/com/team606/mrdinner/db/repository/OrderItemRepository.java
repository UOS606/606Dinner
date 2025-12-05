package com.team606.mrdinner.db.repository;

import com.team606.mrdinner.db.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {}
