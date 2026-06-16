package com.shuttleplay.server.domain.group.controller;

import com.shuttleplay.server.domain.group.service.SessionGuestJoinService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sessions/{sessionId}/guest-join")
public class SessionGuestJoinController {
    private static final Duration GUEST_COOKIE_MAX_AGE = Duration.ofDays(30);

    private final SessionGuestJoinService service;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> preview(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long sessionId,
            HttpServletRequest request
    ) {
        Long userId = user == null ? null : user.getId();
        return ResponseEntity.ok(ApiResponse.success(
                "Request completed.",
                service.preview(sessionId, userId, readGuestCookie(request, sessionId))
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> submit(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long sessionId,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request
    ) {
        Long userId = user == null ? null : user.getId();
        SessionGuestJoinService.GuestJoinResult result = service.submit(
                sessionId,
                userId,
                body,
                readGuestCookie(request, sessionId)
        );
        ResponseEntity.BodyBuilder response = ResponseEntity.ok();
        if (result.hasGuestToken()) {
            response.header(HttpHeaders.SET_COOKIE, createGuestCookie(request, sessionId, result.guestToken()).toString());
        }
        return response.body(ApiResponse.success("Request completed.", result.data()));
    }

    private String readGuestCookie(HttpServletRequest request, Long sessionId) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        String cookieName = guestCookieName(sessionId);
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private ResponseCookie createGuestCookie(HttpServletRequest request, Long sessionId, String token) {
        return ResponseCookie.from(guestCookieName(sessionId), token)
                .httpOnly(true)
                .secure(isSecureRequest(request))
                .sameSite("Lax")
                .path("/")
                .maxAge(GUEST_COOKIE_MAX_AGE)
                .build();
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        return request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
    }

    private String guestCookieName(Long sessionId) {
        return "sp_guest_session_" + sessionId;
    }
}
