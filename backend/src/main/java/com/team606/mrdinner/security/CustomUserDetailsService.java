package com.team606.mrdinner.security;

import com.team606.mrdinner.entity.Customer;
import com.team606.mrdinner.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final CustomerRepository customerRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Customer c = customerRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // roles/authorities가 필요하면 여기에 부여
        return User.withUsername(c.getUsername())
                .password(c.getPasswordHash())
                .authorities("ROLE_USER")
                .build();
    }
}
