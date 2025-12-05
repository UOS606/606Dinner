package com.team606.mrdinner.db.repository;

import com.team606.mrdinner.db.entity.Customer;
import com.team606.mrdinner.db.entity.Order;
import com.team606.mrdinner.db.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerUsernameAndStatus(String username, OrderStatus status);

    Optional<Order> findByCustomerUsernameAndCartedTime(String username, OffsetDateTime cartedTime);
    List<Order> findByCustomer(Customer customer);
}
