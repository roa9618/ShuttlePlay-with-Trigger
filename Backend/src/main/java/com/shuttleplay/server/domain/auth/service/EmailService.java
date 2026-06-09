package com.shuttleplay.server.domain.auth.service;

import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final ObjectProvider<JavaMailSender> javaMailSenderProvider;

    @Value("${spring.mail.from:}")
    private String sender;

    public void sendVerificationCode(String email, String code, int expiresInMinutes) {
        sendCodeEmail(
                email,
                code,
                expiresInMinutes,
                "[ShuttlePlay] 이메일 인증 코드 안내",
                "이메일 인증 코드",
                "셔틀플레이 회원가입을 완료하려면",
                "아래 인증 코드를 입력해주세요."
        );
    }

    public void sendPasswordResetLink(String email, String resetLink, int expiresInMinutes) {
        JavaMailSender mailSender = javaMailSenderProvider.getIfAvailable();

        if (mailSender == null || sender == null || sender.isBlank()) {
            log.info("[ShuttlePlay 비밀번호 재설정 링크] email={}, resetLink={}, expiresInMinutes={}", email, resetLink, expiresInMinutes);
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mimeMessage,
                    true,
                    StandardCharsets.UTF_8.name()
            );

            helper.setFrom(sender);
            helper.setTo(email);
            helper.setSubject("[ShuttlePlay] 비밀번호 재설정 링크 안내");
            helper.setText(
                    createPasswordResetPlainTextMessage(resetLink, expiresInMinutes),
                    createPasswordResetHtmlMessage(resetLink, expiresInMinutes)
            );

            mailSender.send(mimeMessage);
        } catch (MessagingException | MailException exception) {
            throw new BusinessException(ErrorCode.EMAIL_SEND_FAILED, exception.getMessage());
        }
    }

    private void sendCodeEmail(
            String email,
            String code,
            int expiresInMinutes,
            String subject,
            String title,
            String description,
            String subDescription
    ) {
        JavaMailSender mailSender = javaMailSenderProvider.getIfAvailable();

        if (mailSender == null || sender == null || sender.isBlank()) {
            log.info("[ShuttlePlay 인증 코드] email={}, code={}, expiresInMinutes={}", email, code, expiresInMinutes);
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mimeMessage,
                    true,
                    StandardCharsets.UTF_8.name()
            );

            helper.setFrom(sender);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(
                    createPlainTextMessage(title, code, expiresInMinutes),
                    createHtmlMessage(title, description, subDescription, code, expiresInMinutes)
            );

            mailSender.send(mimeMessage);
        } catch (MessagingException | MailException exception) {
            throw new BusinessException(ErrorCode.EMAIL_SEND_FAILED, exception.getMessage());
        }
    }

    private String createPlainTextMessage(String title, String code, int expiresInMinutes) {
        return """
                안녕하세요. ShuttlePlay입니다.

                %s는 아래와 같습니다.

                인증 코드: %s

                인증 코드는 %d분 동안 유효합니다.
                본인이 요청하지 않았다면 이 메일을 무시해주세요.
                """.formatted(title, code, expiresInMinutes);
    }

    private String createPasswordResetPlainTextMessage(String resetLink, int expiresInMinutes) {
        return """
                안녕하세요. ShuttlePlay입니다.

                비밀번호 재설정을 요청하셨습니다.
                아래 링크로 접속해 새 비밀번호를 설정해주세요.

                재설정 링크: %s

                링크는 %d분 동안 유효합니다.
                본인이 요청하지 않았다면 이 메일을 무시해주세요.
                """.formatted(resetLink, expiresInMinutes);
    }

    private String createHtmlMessage(
            String title,
            String description,
            String subDescription,
            String code,
            int expiresInMinutes
    ) {
        return """
                <!doctype html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>ShuttlePlay 인증 코드</title>
                </head>
                <body style="margin:0; padding:0; background:#FDFCFE; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#2D2433;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; margin:0; padding:40px 16px; background:linear-gradient(180deg, #FDFCFE 0%, #F8F5FB 100%);">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; margin:0 auto;">
                                    <tr>
                                        <td align="center" style="padding:0 0 20px 0;">
                                            <div style="display:inline-block; padding:10px 18px; border-radius:999px; background:#F3E8FF; color:#A855F7; font-size:13px; font-weight:700; letter-spacing:0.02em;">
                                                ShuttlePlay
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="background:#FFFFFF; border:1px solid #E9D5FF; border-radius:28px; box-shadow:0 18px 45px rgba(168, 85, 247, 0.14); overflow:hidden;">
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding:34px 32px 24px 32px; text-align:center;">
                                                        <div style="width:58px; height:58px; margin:0 auto 18px auto; border-radius:22px; background:linear-gradient(135deg, #A855F7 0%, #C084FC 55%, #6366F1 100%); box-shadow:0 12px 28px rgba(168, 85, 247, 0.26); line-height:58px; color:#FFFFFF; font-size:26px; font-weight:800;">
                                                            S
                                                        </div>

                                                        <h1 style="margin:0; color:#2D2433; font-size:25px; line-height:1.45; font-weight:700;">
                                                            {{title}}
                                                        </h1>

                                                        <p style="margin:10px 0 0 0; color:#7C6B8A; font-size:14px; line-height:1.7;">
                                                            {{description}}<br>
                                                            {{subDescription}}
                                                        </p>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style="padding:0 32px;">
                                                        <div style="padding:22px 18px; border-radius:22px; background:#FDFCFE; border:1px solid #E9D5FF; text-align:center;">
                                                            <div style="margin:0 0 8px 0; color:#7C6B8A; font-size:12px; font-weight:600;">
                                                                VERIFICATION CODE
                                                            </div>

                                                            <div style="font-size:36px; line-height:1.2; font-weight:800; letter-spacing:8px; color:#A855F7;">
                                                                {{code}}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style="padding:22px 32px 0 32px;">
                                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:18px; background:#F3E8FF;">
                                                            <tr>
                                                                <td style="padding:14px 16px; color:#6B21A8; font-size:13px; line-height:1.6;">
                                                                    <strong>유효 시간</strong>은 {{expiresInMinutes}}분입니다.<br>
                                                                    시간이 지나면 인증 코드를 다시 발송해주세요.
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style="padding:24px 32px 34px 32px;">
                                                        <p style="margin:0; color:#7C6B8A; font-size:12px; line-height:1.7; text-align:center;">
                                                            본인이 요청하지 않은 메일이라면 이 메시지를 무시하셔도 됩니다.<br>
                                                            더 쉽고 공정한 배드민턴 모임 운영, ShuttlePlay
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td align="center" style="padding:18px 0 0 0;">
                                            <p style="margin:0; color:#A58AB8; font-size:12px; line-height:1.6;">
                                                © ShuttlePlay. All rights reserved.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .replace("{{title}}", title)
                .replace("{{description}}", description)
                .replace("{{subDescription}}", subDescription)
                .replace("{{code}}", code)
                .replace("{{expiresInMinutes}}", String.valueOf(expiresInMinutes));
    }

    private String createPasswordResetHtmlMessage(String resetLink, int expiresInMinutes) {
        return """
                <!doctype html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>ShuttlePlay 비밀번호 재설정</title>
                </head>
                <body style="margin:0; padding:0; background:#FDFCFE; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#2D2433;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; margin:0; padding:40px 16px; background:linear-gradient(180deg, #FDFCFE 0%, #F8F5FB 100%);">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; margin:0 auto;">
                                    <tr>
                                        <td align="center" style="padding:0 0 20px 0;">
                                            <div style="display:inline-block; padding:10px 18px; border-radius:999px; background:#F3E8FF; color:#A855F7; font-size:13px; font-weight:700; letter-spacing:0.02em;">
                                                ShuttlePlay
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="background:#FFFFFF; border:1px solid #E9D5FF; border-radius:28px; box-shadow:0 18px 45px rgba(168, 85, 247, 0.14); overflow:hidden;">
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding:34px 32px 24px 32px; text-align:center;">
                                                        <div style="width:58px; height:58px; margin:0 auto 18px auto; border-radius:22px; background:linear-gradient(135deg, #A855F7 0%, #C084FC 55%, #6366F1 100%); box-shadow:0 12px 28px rgba(168, 85, 247, 0.26); line-height:58px; color:#FFFFFF; font-size:26px; font-weight:800;">
                                                            S
                                                        </div>

                                                        <h1 style="margin:0; color:#2D2433; font-size:25px; line-height:1.45; font-weight:700;">
                                                            비밀번호 재설정
                                                        </h1>

                                                        <p style="margin:10px 0 0 0; color:#7C6B8A; font-size:14px; line-height:1.7;">
                                                            아래 버튼을 눌러 새 비밀번호를 설정해주세요.
                                                        </p>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td align="center" style="padding:4px 32px 0 32px;">
                                                        <a href="{{resetLink}}" style="display:block; width:100%; box-sizing:border-box; padding:15px 18px; border-radius:16px; background:linear-gradient(135deg, #A855F7 0%, #9333EA 100%); color:#FFFFFF; text-decoration:none; font-size:15px; font-weight:700; text-align:center; box-shadow:0 12px 24px rgba(168, 85, 247, 0.24);">
                                                            비밀번호 재설정하기
                                                        </a>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style="padding:22px 32px 0 32px;">
                                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:18px; background:#F3E8FF;">
                                                            <tr>
                                                                <td style="padding:14px 16px; color:#6B21A8; font-size:13px; line-height:1.6;">
                                                                    <strong>유효 시간</strong>은 {{expiresInMinutes}}분입니다.<br>
                                                                    시간이 지나면 비밀번호 재설정 링크를 다시 발송해주세요.
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style="padding:24px 32px 34px 32px;">
                                                        <p style="margin:0; color:#7C6B8A; font-size:12px; line-height:1.7; text-align:center;">
                                                            본인이 요청하지 않은 메일이라면 이 메시지를 무시하셔도 됩니다.<br>
                                                            더 쉽고 공정한 배드민턴 모임 운영, ShuttlePlay
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td align="center" style="padding:18px 0 0 0;">
                                            <p style="margin:0; color:#A58AB8; font-size:12px; line-height:1.6;">
                                                © ShuttlePlay. All rights reserved.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .replace("{{resetLink}}", resetLink)
                .replace("{{expiresInMinutes}}", String.valueOf(expiresInMinutes));
    }
}