package com.team606.mrdinner.service;

import com.team606.mrdinner.entity.Customer;
import com.team606.mrdinner.entity.PasswordResetToken;
import com.team606.mrdinner.repository.CustomerRepository;
import com.team606.mrdinner.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final CustomerRepository customerRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // 애플리케이션 설정에 넣어두면 편해요: app.frontend.base-url=https://example.com
    private final String frontendBaseUrl = System.getProperty("app.frontend.base-url",
            "http://localhost:3000"); // 기본값 로컬

    /** 재설정 링크 발급(존재하지 않는 이메일도 성공 응답) */
    public void issueResetLink(String email) {
        if (email == null || email.isBlank()) return;

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isEmpty()) {
            // 보안상 존재여부 노출하지 않음: 그냥 성공처럼 동작
            return;
        }

        Customer customer = customerOpt.get();

        // 기존 유효 토큰 무효화(선택)
        tokenRepository.invalidateAllByCustomerId(customer.getId(), Instant.now());

        // 새 토큰 생성(유효기간 30분 예시)
        String token = UUID.randomUUID().toString();
        PasswordResetToken prt = PasswordResetToken.builder()
                .customer(customer)
                .token(token)
                .expiresAt(Instant.now().plus(30, ChronoUnit.MINUTES))
                .used(false)
                .build();
        tokenRepository.save(prt);

        // 프론트의 재설정 페이지 경로에 맞추세요 (예: /reset-password?token=...)
        String link = frontendBaseUrl + "/reset-password?token=" + token;

        emailService.sendPasswordResetLink(email, link);
    }

    /** 토큰으로 비밀번호 재설정 */
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("유효하지 않은 요청입니다.");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("새 비밀번호를 입력해 주세요.");
        }

        PasswordResetToken prt = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 토큰입니다."));

        if (prt.isUsed() || prt.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("토큰이 만료되었거나 이미 사용되었습니다.");
        }

        Customer customer = prt.getCustomer();
        customer.setPasswordHash(passwordEncoder.encode(newPassword));
        customerRepository.save(customer);

        prt.setUsed(true);
        tokenRepository.save(prt);
    }
}
