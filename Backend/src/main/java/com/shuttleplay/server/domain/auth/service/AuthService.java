package com.shuttleplay.server.domain.auth.service;

import com.shuttleplay.server.domain.auth.dto.request.CheckEmailRequest;
import com.shuttleplay.server.domain.auth.dto.request.EmailVerificationConfirmRequest;
import com.shuttleplay.server.domain.auth.dto.request.EmailVerificationSendRequest;
import com.shuttleplay.server.domain.auth.dto.request.LoginRequest;
import com.shuttleplay.server.domain.auth.dto.request.RegisterRequest;
import com.shuttleplay.server.domain.auth.dto.request.TokenReissueRequest;
import com.shuttleplay.server.domain.auth.dto.response.CheckEmailResponse;
import com.shuttleplay.server.domain.auth.dto.response.EmailVerificationConfirmResponse;
import com.shuttleplay.server.domain.auth.dto.response.EmailVerificationSendResponse;
import com.shuttleplay.server.domain.auth.dto.response.LoginResponse;
import com.shuttleplay.server.domain.auth.dto.response.LoginUserResponse;
import com.shuttleplay.server.domain.auth.dto.response.RegisterResponse;
import com.shuttleplay.server.domain.auth.dto.response.TokenReissueResponse;
import com.shuttleplay.server.domain.auth.entity.EmailVerification;
import com.shuttleplay.server.domain.auth.entity.RefreshToken;
import com.shuttleplay.server.domain.auth.repository.EmailVerificationRepository;
import com.shuttleplay.server.domain.auth.repository.RefreshTokenRepository;
import com.shuttleplay.server.domain.auth.util.RefreshTokenGenerator;
import com.shuttleplay.server.domain.auth.util.VerificationCodeGenerator;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.AuthProvider;
import com.shuttleplay.server.domain.user.enums.UserStatus;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.domain.user.util.InitialMmrCalculator;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import com.shuttleplay.server.global.security.JwtTokenProvider;
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
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

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

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndProvider(request.getEmail(), AuthProvider.LOCAL)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        validateLoginAvailable(user);
        validatePassword(request.getPassword(), user.getPassword());

        String accessToken = jwtTokenProvider.createAccessToken(user);

        String refreshToken = null;
        Long refreshTokenExpiresIn = null;

        if (request.isAutoLogin()) {
            RefreshToken savedRefreshToken = createRefreshToken(user.getId());

            refreshToken = savedRefreshToken.getToken();
            refreshTokenExpiresIn = jwtTokenProvider.getRefreshTokenExpirationMillis();
        }

        return LoginResponse.of(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpirationMillis(),
                refreshTokenExpiresIn,
                LoginUserResponse.from(user)
        );
    }

    @Transactional
    public TokenReissueResponse reissueToken(TokenReissueRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BusinessException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));

        validateRefreshToken(refreshToken);

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        validateLoginAvailable(user);

        refreshToken.revoke();

        String newAccessToken = jwtTokenProvider.createAccessToken(user);
        RefreshToken newRefreshToken = createRefreshToken(user.getId());

        return TokenReissueResponse.of(
                newAccessToken,
                newRefreshToken.getToken(),
                jwtTokenProvider.getAccessTokenExpirationMillis(),
                jwtTokenProvider.getRefreshTokenExpirationMillis()
        );
    }

    private RefreshToken createRefreshToken(Long userId) {
        refreshTokenRepository.findByUserIdAndRevokedFalse(userId)
                .ifPresent(RefreshToken::revoke);

        LocalDateTime expiresAt = LocalDateTime.now()
                .plusNanos(jwtTokenProvider.getRefreshTokenExpirationMillis() * 1_000_000);

        RefreshToken refreshToken = RefreshToken.create(
                userId,
                RefreshTokenGenerator.generate(),
                expiresAt
        );

        return refreshTokenRepository.save(refreshToken);
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

    private void validateLoginAvailable(User user) {
        if (user.getStatus() == UserStatus.DELETED) {
            throw new BusinessException(ErrorCode.DELETED_USER);
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new BusinessException(ErrorCode.INACTIVE_USER);
        }

        if (!user.isLocalAccount()) {
            throw new BusinessException(ErrorCode.SOCIAL_ACCOUNT_LOGIN_NOT_ALLOWED);
        }
    }

    private void validatePassword(String rawPassword, String encodedPassword) {
        if (encodedPassword == null || !passwordEncoder.matches(rawPassword, encodedPassword)) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }
    }

    private void validateRefreshToken(RefreshToken refreshToken) {
        if (refreshToken.isExpired()) {
            throw new BusinessException(ErrorCode.EXPIRED_REFRESH_TOKEN);
        }

        if (refreshToken.isInvalid()) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
    }
}