package com.team606.mrdinner.controller;

import com.team606.mrdinner.service.AuthService;
import com.team606.mrdinner.service.PasswordResetService;
import com.team606.mrdinner.dto.ResetPasswordRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    // 로그인
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

    // 내 정보 확인
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

    // 비밀번호 재설정 링크 요청 (FindPWModal.jsx에서 요청하는 엔드포인트)
    @PostMapping("/auth/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        passwordResetService.issueResetLink(email); // 서비스에서 처리
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "비밀번호 재설정 링크가 이메일로 전송되었습니다."
        ));
    }

    // 실제 비밀번호 변경 요청 (프론트의 reset-password 페이지에서 사용)
    @PostMapping("/auth/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody ResetPasswordRequest req) {
        passwordResetService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요."
        ));
    }
}
