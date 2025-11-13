package com.team606.mrdinner.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "customers",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email"),
                @UniqueConstraint(columnNames = "username")
        })
@Getter
@Setter
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    private String username;

    private String phone;

    private String address;

    private String cardNumber; // 실제 운영 서비스라면 별도 결제 모듈/PG사에 위임 권장

    private String passwordHash;

    private String role = "ROLE_USER";

    private boolean enabled = true;

    /** 새로 추가된 필드: 쿠폰 관리용 **/
    @Column(nullable = false)
    private int unusedCouponCount = 0; // 사용 가능한 쿠폰 수

    @Column(nullable = false)
    private int usedCouponCount = 0;   // 이미 사용한 쿠폰 수
}
