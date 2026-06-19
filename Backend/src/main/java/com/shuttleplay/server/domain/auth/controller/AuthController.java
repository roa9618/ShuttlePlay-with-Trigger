package com.shuttleplay.server.domain.auth.controller;

import com.shuttleplay.server.domain.auth.dto.request.CheckEmailRequest;
import com.shuttleplay.server.domain.auth.dto.request.EmailVerificationConfirmRequest;
import com.shuttleplay.server.domain.auth.dto.request.EmailVerificationSendRequest;
import com.shuttleplay.server.domain.auth.dto.request.LoginRequest;
import com.shuttleplay.server.domain.auth.dto.request.PasswordResetConfirmRequest;
import com.shuttleplay.server.domain.auth.dto.request.PasswordResetSendRequest;
import com.shuttleplay.server.domain.auth.dto.request.RegisterRequest;
import com.shuttleplay.server.domain.auth.dto.response.CheckEmailResponse;
import com.shuttleplay.server.domain.auth.dto.response.EmailVerificationConfirmResponse;
import com.shuttleplay.server.domain.auth.dto.response.EmailVerificationSendResponse;
import com.shuttleplay.server.domain.auth.dto.response.LoginResponse;
import com.shuttleplay.server.domain.auth.dto.response.LogoutResponse;
import com.shuttleplay.server.domain.auth.dto.response.PasswordResetConfirmResponse;
import com.shuttleplay.server.domain.auth.dto.response.PasswordResetSendResponse;
import com.shuttleplay.server.domain.auth.dto.response.RegisterResponse;
import com.shuttleplay.server.domain.auth.dto.response.TokenReissueResponse;
import com.shuttleplay.server.domain.auth.service.AuthService;
import com.shuttleplay.server.domain.auth.service.RefreshTokenCookieService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final AuthService authService;
    private final RefreshTokenCookieService refreshTokenCookieService;

    @PostMapping("/check-email")
    public ResponseEntity<ApiResponse<CheckEmailResponse>> checkEmail(
            @Valid @RequestBody CheckEmailRequest request
    ) {
        CheckEmailResponse response = authService.checkEmail(request);
        String message = response.isAvailable()
                ? "사용 가능한 이메일입니다."
                : "이미 사용 중인 이메일입니다.";

        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @PostMapping("/email-verification/send")
    public ResponseEntity<ApiResponse<EmailVerificationSendResponse>> sendEmailVerification(
            @Valid @RequestBody EmailVerificationSendRequest request
    ) {
        EmailVerificationSendResponse response = authService.sendEmailVerification(request);

        return ResponseEntity.ok(ApiResponse.success("이메일 인증 코드가 발송되었습니다.", response));
    }

    @PostMapping("/email-verification/confirm")
    public ResponseEntity<ApiResponse<EmailVerificationConfirmResponse>> confirmEmailVerification(
            @Valid @RequestBody EmailVerificationConfirmRequest request
    ) {
        EmailVerificationConfirmResponse response = authService.confirmEmailVerification(request);

        return ResponseEntity.ok(ApiResponse.success("이메일 인증이 완료되었습니다.", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        RegisterResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("회원가입이 완료되었습니다.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse servletResponse
    ) {
        AuthService.LoginResult result = authService.login(request);

        refreshTokenCookieService.addRefreshTokenCookie(
                servletResponse,
                result.refreshToken(),
                result.response().getRefreshTokenExpiresIn(),
                result.persistent()
        );

        return ResponseEntity.ok(ApiResponse.success("로그인되었습니다.", result.response()));
    }

    @PostMapping({"/token/reissue", "/session"})
    public ResponseEntity<ApiResponse<TokenReissueResponse>> reissueToken(
            @CookieValue(
                    name = RefreshTokenCookieService.REFRESH_TOKEN_COOKIE_NAME,
                    required = false
            ) String refreshToken,
            HttpServletResponse servletResponse
    ) {
        AuthService.TokenReissueResult result = authService.reissueToken(refreshToken);

        refreshTokenCookieService.addRefreshTokenCookie(
                servletResponse,
                result.refreshToken(),
                result.response().getRefreshTokenExpiresIn(),
                result.persistent()
        );

        return ResponseEntity.ok(ApiResponse.success("토큰이 재발급되었습니다.", result.response()));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<LogoutResponse>> logout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request,
            HttpServletResponse servletResponse
    ) {
        String accessToken = resolveAccessToken(request);
        LogoutResponse response = authService.logout(userDetails.getId(), accessToken);

        refreshTokenCookieService.clearRefreshTokenCookie(servletResponse);
        clearGuestSessionCookies(request, servletResponse);

        return ResponseEntity.ok(ApiResponse.success("로그아웃되었습니다.", response));
    }

    private void clearGuestSessionCookies(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return;
        boolean secure = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        for (Cookie cookie : cookies) {
            if (!cookie.getName().startsWith("sp_guest_session_")) continue;
            response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(cookie.getName(), "")
                    .httpOnly(true).secure(secure).sameSite("Lax").path("/").maxAge(0).build().toString());
        }
    }

    @PostMapping("/password-reset/send")
    public ResponseEntity<ApiResponse<PasswordResetSendResponse>> sendPasswordResetLink(
            @Valid @RequestBody PasswordResetSendRequest request
    ) {
        PasswordResetSendResponse response = authService.sendPasswordResetLink(request);

        return ResponseEntity.ok(ApiResponse.success("비밀번호 재설정 링크가 발송되었습니다.", response));
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<ApiResponse<PasswordResetConfirmResponse>> confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmRequest request
    ) {
        PasswordResetConfirmResponse response = authService.confirmPasswordReset(request);

        return ResponseEntity.ok(ApiResponse.success("비밀번호가 재설정되었습니다.", response));
    }

    private String resolveAccessToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }

        return null;
    }
}
