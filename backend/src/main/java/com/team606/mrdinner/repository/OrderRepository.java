package com.team606.mrdinner.repository;

import com.team606.mrdinner.entity.Order;
import com.team606.mrdinner.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerUsernameAndStatus(String username, OrderStatus status);

    Optional<Order> findByCustomerUsernameAndCartedTime(String username, Instant cartedTime);
}
