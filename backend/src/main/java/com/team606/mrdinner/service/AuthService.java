package com.team606.mrdinner.service;

import com.team606.mrdinner.entity.Customer;
import com.team606.mrdinner.repository.CustomerRepository;
import com.team606.mrdinner.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil; // 의존성 주입받음

    /**
     * 로그인 시도
     * - 성공: JWT 토큰 반환
     * - 실패: Optional.empty()
     */
    public Optional<String> authenticate(String username, String rawPassword) {
        return customerRepository.findByUsername(username)
                .filter(c -> passwordEncoder.matches(rawPassword, c.getPasswordHash()))
                .map(Customer::getUsername)
                .map(jwtUtil::generateToken);
    }
}