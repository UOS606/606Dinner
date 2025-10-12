package com.team606.mrdinner.repository;

import com.team606.mrdinner.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OrderRepository extends JpaRepository<Order, Long> {}
