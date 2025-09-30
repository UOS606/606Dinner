package com.team606.mrdinner.controller;

import com.team606.mrdinner.dto.CustomerDto;
import com.team606.mrdinner.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/signup")
@RequiredArgsConstructor
public class CustomerController {

    @Autowired
    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<String> signup(@Valid @RequestBody CustomerDto dto) {
        Long id = customerService.register(dto);
        return ResponseEntity.ok("회원가입 성공! ID=" + id);
    }
}
