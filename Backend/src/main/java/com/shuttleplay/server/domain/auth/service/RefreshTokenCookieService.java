package com.shuttleplay.server.domain.auth.service;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RefreshTokenCookieService {
    public static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    private static final String REFRESH_TOKEN_COOKIE_PATH = "/api/auth";
    private static final String SAME_SITE = "Lax";

    @Value("${app.auth-cookie-secure:true}")
    private boolean secure;

    public void addRefreshTokenCookie(
            HttpServletResponse response,
            String refreshToken,
            long refreshTokenExpirationMillis,
            boolean persistent
    ) {
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie
                .from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(secure)
                .sameSite(SAME_SITE)
                .path(REFRESH_TOKEN_COOKIE_PATH);

        if (persistent) {
            cookieBuilder.maxAge(Duration.ofMillis(refreshTokenExpirationMillis));
        }

        response.addHeader(HttpHeaders.SET_COOKIE, cookieBuilder.build().toString());
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie
                .from(REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(SAME_SITE)
                .path(REFRESH_TOKEN_COOKIE_PATH)
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
