package com.team606.mrdinner.repository;

import com.team606.mrdinner.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {}
