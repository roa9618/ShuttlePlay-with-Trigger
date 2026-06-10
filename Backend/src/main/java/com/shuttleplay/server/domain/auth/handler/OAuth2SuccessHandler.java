package com.shuttleplay.server.domain.auth.handler;

import com.shuttleplay.server.domain.auth.entity.RefreshToken;
import com.shuttleplay.server.domain.auth.repository.RefreshTokenRepository;
import com.shuttleplay.server.domain.auth.util.RefreshTokenGenerator;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import com.shuttleplay.server.global.security.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements org.springframework.security.web.authentication.AuthenticationSuccessHandler {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.oauth2-redirect-url}")
    private String oauth2RedirectUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        Long userId = extractUserId(oauth2User);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        String accessToken = jwtTokenProvider.createAccessToken(user);
        RefreshToken refreshToken = createRefreshToken(user.getId());

        String redirectUrl = createRedirectUrl(
                accessToken,
                refreshToken.getToken(),
                user.isProfileCompleted()
        );

        response.sendRedirect(redirectUrl);
    }

    private Long extractUserId(OAuth2User oauth2User) {
        Object userIdAttribute = oauth2User.getAttribute("userId");

        if (userIdAttribute == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        if (userIdAttribute instanceof Long userId) {
            return userId;
        }

        if (userIdAttribute instanceof Integer userId) {
            return userId.longValue();
        }

        return Long.valueOf(userIdAttribute.toString());
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

    private String createRedirectUrl(
            String accessToken,
            String refreshToken,
            boolean profileCompleted
    ) {
        return oauth2RedirectUrl
                + "?accessToken=" + encode(accessToken)
                + "&refreshToken=" + encode(refreshToken)
                + "&profileCompleted=" + profileCompleted;
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}