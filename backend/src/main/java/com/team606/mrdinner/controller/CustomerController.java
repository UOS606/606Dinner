package com.team606.mrdinner.controller;

import com.team606.mrdinner.dto.CustomerDto;
import com.team606.mrdinner.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/signup")
@RequiredArgsConstructor
public class CustomerController {

    @Autowired
    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody CustomerDto dto) {
        Map<String, Object> response = new HashMap<>();

        try {
            Long id = customerService.register(dto);

            // 회원가입 성공 응답
            response.put("success", true);
            response.put("message", "회원가입 성공!");
            response.put("id", id);

            return ResponseEntity.ok(response);

        } catch (DuplicateKeyException e) {
            // 중복 아이디/이메일 등 예외 처리
            response.put("success", false);
            response.put("message", "이미 존재하는 아이디입니다.");
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            // 일반적인 서버 에러 처리
            response.put("success", false);
            response.put("message", "회원가입 처리 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

}
