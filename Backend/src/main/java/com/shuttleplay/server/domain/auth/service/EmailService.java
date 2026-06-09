package com.shuttleplay.server.domain.auth.service;

import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final ObjectProvider<JavaMailSender> javaMailSenderProvider;

    @Value("${spring.mail.username:}")
    private String sender;

    public void sendVerificationCode(String email, String code, int expiresInMinutes) {
        JavaMailSender mailSender = javaMailSenderProvider.getIfAvailable();

        if (mailSender == null) {
            log.info("[ShuttlePlay 이메일 인증 코드] email={}, code={}, expiresInMinutes={}", email, code, expiresInMinutes);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();

            if (sender != null && !sender.isBlank()) {
                message.setFrom(sender);
            }

            message.setTo(email);
            message.setSubject("[ShuttlePlay] 이메일 인증 코드 안내");
            message.setText(createVerificationMessage(code, expiresInMinutes));

            mailSender.send(message);
        } catch (MailException exception) {
            throw new BusinessException(ErrorCode.EMAIL_SEND_FAILED, exception.getMessage());
        }
    }

    private String createVerificationMessage(String code, int expiresInMinutes) {
        return """
                안녕하세요. ShuttlePlay입니다.

                이메일 인증 코드는 아래와 같습니다.

                인증 코드: %s

                인증 코드는 %d분 동안 유효합니다.
                본인이 요청하지 않았다면 이 메일을 무시해주세요.
                """.formatted(code, expiresInMinutes);
    }
}