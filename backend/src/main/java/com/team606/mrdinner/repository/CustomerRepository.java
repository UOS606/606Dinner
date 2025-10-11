package com.team606.mrdinner.repository;

import com.team606.mrdinner.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<Customer> findByUsername(String username);
}
