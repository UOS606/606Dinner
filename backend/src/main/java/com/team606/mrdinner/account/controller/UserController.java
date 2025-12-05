package com.team606.mrdinner.account.controller;

import com.team606.mrdinner.account.service.CustomerService;
import com.team606.mrdinner.db.entity.Customer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Map<String, Object> response = new HashMap<>();

        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                response.put("success", false);
                response.put("message", "인증 정보가 없습니다.");
                return ResponseEntity.status(401).body(response);
            }

            String username = auth.getName();
            Customer customer = customerService.findByUsername(username);

            if (customer == null) {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.status(404).body(response);
            }

            response.put("success", true);
            response.put("name", customer.getName());
            response.put("username", customer.getUsername());
            response.put("email", customer.getEmail());
            response.put("phone", customer.getPhone());
            response.put("address", customer.getAddress());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 정보 조회 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
