package com.team606.mrdinner;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class PasswordHashCheckTest {

    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void check() {
        String raw = "kimhs606@";
        String hash = "$2a$10$9ZoKD2UvY0gnjhIWXojWkuLn2uizD1Ow.N8UAagr8hJnGwb3/V3v.";
        System.out.println(passwordEncoder.matches(raw, hash)); // true/false 출력
    }
}
