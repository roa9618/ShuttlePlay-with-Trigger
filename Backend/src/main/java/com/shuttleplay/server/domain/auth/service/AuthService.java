package com.shuttleplay.server.domain.auth.service;

import com.shuttleplay.server.domain.auth.dto.request.CheckEmailRequest;
import com.shuttleplay.server.domain.auth.dto.request.EmailVerificationConfirmRequest;
import com.shuttleplay.server.domain.auth.dto.request.EmailVerificationSendRequest;
import com.shuttleplay.server.domain.auth.dto.request.LoginRequest;
import com.shuttleplay.server.domain.auth.dto.request.PasswordResetConfirmRequest;
import com.shuttleplay.server.domain.auth.dto.request.PasswordResetSendRequest;
import com.shuttleplay.server.domain.auth.dto.request.RegisterRequest;
import com.shuttleplay.server.domain.auth.dto.request.TokenReissueRequest;
import com.shuttleplay.server.domain.auth.dto.response.CheckEmailResponse;
import com.shuttleplay.server.domain.auth.dto.response.EmailVerificationConfirmResponse;
import com.shuttleplay.server.domain.auth.dto.response.EmailVerificationSendResponse;
import com.shuttleplay.server.domain.auth.dto.response.LoginResponse;
import com.shuttleplay.server.domain.auth.dto.response.LoginUserResponse;
import com.shuttleplay.server.domain.auth.dto.response.LogoutResponse;
import com.shuttleplay.server.domain.auth.dto.response.PasswordResetConfirmResponse;
import com.shuttleplay.server.domain.auth.dto.response.PasswordResetSendResponse;
import com.shuttleplay.server.domain.auth.dto.response.RegisterResponse;
import com.shuttleplay.server.domain.auth.dto.response.TokenReissueResponse;
import com.shuttleplay.server.domain.auth.entity.AccessTokenBlacklist;
import com.shuttleplay.server.domain.auth.entity.EmailVerification;
import com.shuttleplay.server.domain.auth.entity.PasswordResetToken;
import com.shuttleplay.server.domain.auth.entity.RefreshToken;
import com.shuttleplay.server.domain.auth.repository.AccessTokenBlacklistRepository;
import com.shuttleplay.server.domain.auth.repository.EmailVerificationRepository;
import com.shuttleplay.server.domain.auth.repository.PasswordResetTokenRepository;
import com.shuttleplay.server.domain.auth.repository.RefreshTokenRepository;
import com.shuttleplay.server.domain.auth.util.PasswordResetTokenGenerator;
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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {
    private static final int EMAIL_VERIFICATION_EXPIRE_MINUTES = 5;
    private static final int PASSWORD_RESET_TOKEN_EXPIRE_MINUTES = 10;

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AccessTokenBlacklistRepository accessTokenBlacklistRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.password-reset-url}")
    private String passwordResetUrl;

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
        validateSignupAgreement(request.getAgreementAccepted());
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
        User user = findLocalUserForLogin(request.getEmail());

        validateAccountStatus(user);
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

        validateAccountStatus(user);

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

    @Transactional
    public LogoutResponse logout(Long userId, String accessToken) {
        revokeActiveRefreshTokens(userId);

        blacklistAccessToken(accessToken);

        return LogoutResponse.of(userId);
    }

    @Transactional
    public PasswordResetSendResponse sendPasswordResetLink(PasswordResetSendRequest request) {
        Optional<User> optionalUser = userRepository.findByEmailAndProvider(
                request.getEmail(),
                AuthProvider.LOCAL
        );

        if (optionalUser.isEmpty()) {
            return PasswordResetSendResponse.of(
                    request.getEmail(),
                    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
            );
        }

        User user = optionalUser.get();

        if (user.getStatus() != UserStatus.ACTIVE) {
            return PasswordResetSendResponse.of(
                    request.getEmail(),
                    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
            );
        }

        String token = PasswordResetTokenGenerator.generate();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(PASSWORD_RESET_TOKEN_EXPIRE_MINUTES);

        PasswordResetToken passwordResetToken = PasswordResetToken.create(
                request.getEmail(),
                token,
                expiresAt
        );

        passwordResetTokenRepository.save(passwordResetToken);

        String resetLink = createPasswordResetLink(token);

        emailService.sendPasswordResetLink(
                request.getEmail(),
                resetLink,
                PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
        );

        return PasswordResetSendResponse.of(
                request.getEmail(),
                PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
        );
    }

    @Transactional
    public PasswordResetConfirmResponse confirmPasswordReset(PasswordResetConfirmRequest request) {
        validatePasswordConfirm(request.getNewPassword(), request.getNewPasswordConfirm());

        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BusinessException(ErrorCode.PASSWORD_RESET_TOKEN_NOT_FOUND));

        validatePasswordResetToken(passwordResetToken);

        User user = userRepository.findByEmailAndProvider(passwordResetToken.getEmail(), AuthProvider.LOCAL)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        validateAccountStatus(user);

        String encodedPassword = passwordEncoder.encode(request.getNewPassword());

        user.updatePassword(encodedPassword);
        passwordResetToken.use();

        revokeActiveRefreshTokens(user.getId());

        return PasswordResetConfirmResponse.of(user.getEmail(), true);
    }

    private void blacklistAccessToken(String accessToken) {
        if (accessTokenBlacklistRepository.existsByToken(accessToken)) {
            return;
        }

        LocalDateTime expiresAt = jwtTokenProvider.getExpiresAt(accessToken);

        AccessTokenBlacklist accessTokenBlacklist = AccessTokenBlacklist.create(
                accessToken,
                expiresAt
        );

        accessTokenBlacklistRepository.save(accessTokenBlacklist);
    }

    private String createPasswordResetLink(String token) {
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);

        return passwordResetUrl + "?token=" + encodedToken;
    }

    private RefreshToken createRefreshToken(Long userId) {
        revokeActiveRefreshTokens(userId);

        LocalDateTime expiresAt = LocalDateTime.now()
                .plusNanos(jwtTokenProvider.getRefreshTokenExpirationMillis() * 1_000_000);

        RefreshToken refreshToken = RefreshToken.create(
                userId,
                RefreshTokenGenerator.generate(),
                expiresAt
        );

        return refreshTokenRepository.save(refreshToken);
    }

    private void revokeActiveRefreshTokens(Long userId) {
        refreshTokenRepository.findAllByUserIdAndRevokedFalse(userId)
                .forEach(RefreshToken::revoke);
    }

    private void validateEmailAvailable(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }
    }

    private void validateSignupAgreement(Boolean agreementAccepted) {
        if (!Boolean.TRUE.equals(agreementAccepted)) {
            throw new BusinessException(ErrorCode.SIGNUP_AGREEMENT_REQUIRED);
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

    private User findLocalUserForLogin(String email) {
        return userRepository.findByEmailAndProvider(email, AuthProvider.LOCAL)
                .orElseThrow(() -> {
                    if (userRepository.existsByEmail(email)) {
                        return new BusinessException(ErrorCode.SOCIAL_ACCOUNT_CANNOT_LOGIN_WITH_PASSWORD);
                    }

                    return new BusinessException(ErrorCode.USER_NOT_FOUND);
                });
    }

    private void validateAccountStatus(User user) {
        if (user.getStatus() == UserStatus.DELETED) {
            throw new BusinessException(ErrorCode.DELETED_USER);
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new BusinessException(ErrorCode.INACTIVE_USER);
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

    private void validatePasswordResetToken(PasswordResetToken passwordResetToken) {
        if (passwordResetToken.isExpired()) {
            throw new BusinessException(ErrorCode.EXPIRED_PASSWORD_RESET_TOKEN);
        }

        if (passwordResetToken.isInvalid()) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD_RESET_TOKEN);
        }
    }
}
