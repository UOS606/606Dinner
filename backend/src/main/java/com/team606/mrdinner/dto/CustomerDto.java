package com.team606.mrdinner.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerDto {

    @NotBlank
    @Size(min = 2, max = 30)
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Pattern(regexp = "[A-Za-z0-9]{4,20}", message = "아이디는 영문/숫자 4~20자여야 합니다.")
    private String username;

    @NotBlank
    private String phone;

    @NotBlank
    private String address;

    @NotBlank
    @Size(min = 16, max = 16, message = "카드번호는 16자리여야 합니다.")
    private String cardNumber;

    @NotBlank
    @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
    private String password;
}