package com.shuttleplay.server.domain.auth.service;

import com.shuttleplay.server.domain.auth.dto.request.CheckEmailRequest;
import com.shuttleplay.server.domain.auth.dto.request.EmailVerificationConfirmRequest;
import com.shuttleplay.server.domain.auth.dto.request.EmailVerificationSendRequest;
import com.shuttleplay.server.domain.auth.dto.request.RegisterRequest;
import com.shuttleplay.server.domain.auth.dto.response.CheckEmailResponse;
import com.shuttleplay.server.domain.auth.dto.response.EmailVerificationConfirmResponse;
import com.shuttleplay.server.domain.auth.dto.response.EmailVerificationSendResponse;
import com.shuttleplay.server.domain.auth.dto.response.RegisterResponse;
import com.shuttleplay.server.domain.auth.entity.EmailVerification;
import com.shuttleplay.server.domain.auth.repository.EmailVerificationRepository;
import com.shuttleplay.server.domain.auth.util.VerificationCodeGenerator;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.domain.user.util.InitialMmrCalculator;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {
    private static final int EMAIL_VERIFICATION_EXPIRE_MINUTES = 5;

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public CheckEmailResponse checkEmail(CheckEmailRequest request) {
        boolean available = !userRepository.existsByEmail(request.getEmail());

        return CheckEmailResponse.of(available);
    }

    @Transactional
    public EmailVerificationSendResponse sendEmailVerification(EmailVerificationSendRequest request) {
        validateEmailAvailable(request.getEmail());

        String code = VerificationCodeGenerator.generate();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(EMAIL_VERIFICATION_EXPIRE_MINUTES);

        EmailVerification emailVerification = EmailVerification.create(
                request.getEmail(),
                code,
                expiresAt
        );

        emailVerificationRepository.save(emailVerification);
        emailService.sendVerificationCode(
                request.getEmail(),
                code,
                EMAIL_VERIFICATION_EXPIRE_MINUTES
        );

        return EmailVerificationSendResponse.of(
                request.getEmail(),
                EMAIL_VERIFICATION_EXPIRE_MINUTES
        );
    }

    @Transactional
    public EmailVerificationConfirmResponse confirmEmailVerification(
            EmailVerificationConfirmRequest request
    ) {
        EmailVerification emailVerification = findLatestEmailVerification(request.getEmail());

        validateVerificationCode(emailVerification, request.getCode());
        emailVerification.verify();

        return EmailVerificationConfirmResponse.of(request.getEmail(), true);
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        validateEmailAvailable(request.getEmail());
        validatePasswordConfirm(request.getPassword(), request.getPasswordConfirm());
        validateEmailVerified(request.getEmail());

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        int initialMmr = InitialMmrCalculator.calculate(request.getGrade());

        User user = User.createLocalUser(
                request.getEmail(),
                encodedPassword,
                request.getName(),
                request.getGender(),
                request.getAgeGroup(),
                request.getGrade(),
                initialMmr
        );

        User savedUser = userRepository.save(user);

        return RegisterResponse.from(savedUser);
    }

    private void validateEmailAvailable(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }
    }

    private void validatePasswordConfirm(String password, String passwordConfirm) {
        if (!password.equals(passwordConfirm)) {
            throw new BusinessException(ErrorCode.PASSWORD_CONFIRM_NOT_MATCH);
        }
    }

    private void validateEmailVerified(String email) {
        EmailVerification emailVerification = findLatestEmailVerification(email);

        if (!emailVerification.isVerified()) {
            throw new BusinessException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
    }

    private EmailVerification findLatestEmailVerification(String email) {
        return emailVerificationRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.EMAIL_VERIFICATION_NOT_FOUND));
    }

    private void validateVerificationCode(EmailVerification emailVerification, String code) {
        if (emailVerification.isExpired()) {
            throw new BusinessException(ErrorCode.EXPIRED_VERIFICATION_CODE);
        }

        if (emailVerification.isCodeMismatch(code)) {
            throw new BusinessException(ErrorCode.INVALID_VERIFICATION_CODE);
        }
    }
}