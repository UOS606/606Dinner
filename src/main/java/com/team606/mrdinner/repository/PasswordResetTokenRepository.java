package com.team606.mrdinner.repository;

import com.team606.mrdinner.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    // 토큰 문자열로 조회 (토큰 유효성 검증용)
    Optional<PasswordResetToken> findByToken(String token);

    // 해당 고객의 기존 토큰을 모두 무효화 (새 토큰 발급 전)
    @Modifying
    @Query("""
        update PasswordResetToken t
           set t.used = true
         where t.customer.id = :customerId
           and t.expiresAt > :now
           and t.used = false
    """)
    void invalidateAllByCustomerId(Long customerId, Instant now);
}