package com.team606.mrdinner.service;

import com.team606.mrdinner.dto.CustomerDto;
import com.team606.mrdinner.entity.Customer;
import com.team606.mrdinner.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {
    @Autowired
    private final CustomerRepository repository;

    @Autowired
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Long register(CustomerDto dto) {
        if (repository.existsByEmail(dto.getEmail()))
            throw new DuplicateKeyException("이미 존재하는 이메일입니다.");
        if (repository.existsByUsername(dto.getUsername()))
            throw new DuplicateKeyException("이미 존재하는 아이디입니다.");

        Customer customer = new Customer();
        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setUsername(dto.getUsername());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        customer.setCardNumber(dto.getCardNumber());
        customer.setPasswordHash(passwordEncoder.encode(dto.getPassword()));

        return repository.save(customer).getId();
    }

    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return repository.existsByUsername(username);
    }
}
