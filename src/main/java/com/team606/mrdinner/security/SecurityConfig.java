package com.team606.mrdinner.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // API + JWT 환경에서는 CSRF 비활성화
                .csrf(csrf -> csrf.disable())
                // WebMvcConfigurer(CorsConfig) 설정 사용
                .cors(cors -> {})
                // 세션 사용 안함 (JWT stateless)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 401/403 응답을 JSON으로 처리 (프론트 파싱 에러 방지)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"success\":false,\"message\":\"인증 필요\"}");
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"success\":false,\"message\":\"접근 거부\"}");
                        })
                )
                // 요청 경로별 인가 정책
                .authorizeHttpRequests(auth -> auth
                        // Preflight 허용 (CORS 403 방지)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 로그인, 회원가입, 비밀번호 재설정 API 공개 허용
                        .requestMatchers(HttpMethod.POST,
                                "/api/login",
                                "/api/signup",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password"
                        ).permitAll()

                        // 필요시 추가 공개 API
                        // .requestMatchers("/api/public/**").permitAll()

                        // 나머지는 인증 필요
                        .anyRequest().authenticated()
                );

        // JWT 필터는 UsernamePasswordAuthenticationFilter 이전에 추가
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
