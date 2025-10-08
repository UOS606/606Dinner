package com.team606.mrdinner.repository;

import com.team606.mrdinner.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<Customer> findByUsername(String username);

    // 비밀번호 재설정 시 이메일로 사용자 조회
    Optional<Customer> findByEmail(String email);
}
