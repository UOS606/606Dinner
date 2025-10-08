package com.team606.mrdinner.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendPasswordResetLink(String toEmail, String link) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[606Dinner] 비밀번호 재설정 링크 안내");
        message.setText(
                "안녕하세요.\n\n" +
                        "아래 링크를 클릭하여 비밀번호를 재설정해 주세요 (30분 내 유효).\n" +
                        link + "\n\n" +
                        "본인이 요청하지 않은 경우, 이 메일을 무시해 주세요.\n\n감사합니다."
        );
        mailSender.send(message);
    }
}
