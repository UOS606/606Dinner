package com.team606.mrdinner.controller;

import com.team606.mrdinner.service.AuthService;
import com.team606.mrdinner.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CustomerService customerService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "아이디/비밀번호를 입력하세요."
            ));
        }

        return authService.authenticate(username, password)
                .<ResponseEntity<Map<String, Object>>>map(token ->
                        ResponseEntity.ok(Map.of(
                                "success", true,
                                "message", "로그인 성공",
                                "token", token,
                                "username", username
                        ))
                )
                .orElseGet(() ->
                        ResponseEntity.status(401).body(Map.of(
                                "success", false,
                                "message", "아이디 또는 비밀번호가 올바르지 않습니다."
                        ))
                );
    }

    @PostMapping("/signup/check-username")
    public ResponseEntity<Map<String, Object>> checkUsername(@RequestBody Map<String, String> request) {
        String username = request.get("username");

        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message", "username은 필수입니다."
                    )
            );
        }

        boolean exists = customerService.existsByUsername(username);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "exists", exists
                )
        );
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "인증되지 않았습니다."
            ));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "username", authentication.getName()
        ));
    }
}

