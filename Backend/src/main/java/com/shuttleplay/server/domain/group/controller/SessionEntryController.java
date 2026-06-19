package com.shuttleplay.server.domain.group.controller;

import com.shuttleplay.server.domain.group.service.SessionEntryService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.util.Map;
import java.util.HashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/session-entry")
public class SessionEntryController {
    private static final Duration GUEST_COOKIE_MAX_AGE = Duration.ofDays(30);
    private final SessionEntryService service;

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> code(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable String code, HttpServletRequest request) {
        return ok(service.previewByCode(code, userId(user), readGuestCookies(request)));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> session(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId,
            @RequestParam(required = false) String code, HttpServletRequest request) {
        return ok(service.previewBySession(sessionId, userId(user), readGuestCookie(request, sessionId), code));
    }

    @PostMapping("/sessions/{sessionId}/decision")
    public ResponseEntity<ApiResponse<Map<String, Object>>> decision(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId,
            @RequestBody Map<String, Object> body, @RequestParam(required = false) String code, HttpServletRequest request) {
        boolean registered = Boolean.TRUE.equals(body.get("registered"));
        return result(service.decide(sessionId, userId(user), registered, body, readGuestCookie(request, sessionId), code), request, sessionId, user != null);
    }

    @PostMapping("/sessions/{sessionId}/attendance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> attendance(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId,
            @RequestBody Map<String, Object> body, HttpServletRequest request) {
        return result(service.attendance(sessionId, userId(user), body, readGuestCookie(request, sessionId)), request, sessionId, user != null);
    }

    @GetMapping("/sessions/{sessionId}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> status(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, HttpServletRequest request) {
        return ok(service.status(sessionId, userId(user), readGuestCookie(request, sessionId)));
    }

    @PostMapping("/sessions/{sessionId}/rest")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rest(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, HttpServletRequest request) {
        return ok(service.toggleRest(sessionId, userId(user), readGuestCookie(request, sessionId)));
    }

    @PostMapping("/sessions/{sessionId}/leave")
    public ResponseEntity<ApiResponse<Map<String, Object>>> leave(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, HttpServletRequest request) {
        return ok(service.leaveEarly(sessionId, userId(user), readGuestCookie(request, sessionId)));
    }

    @GetMapping("/sessions/{sessionId}/next-match")
    public ResponseEntity<ApiResponse<Map<String, Object>>> nextMatch(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, HttpServletRequest request) {
        return ok(service.nextMatch(sessionId, userId(user), readGuestCookie(request, sessionId)));
    }

    @GetMapping("/sessions/{sessionId}/match-call")
    public ResponseEntity<ApiResponse<Map<String, Object>>> matchCall(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, HttpServletRequest request) {
        return ok(service.matchCall(sessionId, userId(user), readGuestCookie(request, sessionId)));
    }

    @GetMapping("/sessions/{sessionId}/current-match")
    public ResponseEntity<ApiResponse<Map<String, Object>>> currentMatch(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, HttpServletRequest request) {
        return ok(service.currentMatch(sessionId, userId(user), readGuestCookie(request, sessionId)));
    }

    @PostMapping("/sessions/{sessionId}/current-match/start")
    public ResponseEntity<ApiResponse<Map<String, Object>>> startCurrentMatch(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId,
            @RequestBody(required = false) Map<String, Object> body, HttpServletRequest request) {
        return ok(service.startCurrentMatch(sessionId, userId(user), readGuestCookie(request, sessionId), body == null ? Map.of() : body));
    }

    @PostMapping("/sessions/{sessionId}/match-result")
    public ResponseEntity<ApiResponse<Map<String, Object>>> matchResult(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId,
            @RequestBody Map<String, Object> body, HttpServletRequest request) {
        return ok(service.submitMatchResult(sessionId, userId(user), readGuestCookie(request, sessionId), body));
    }

    @GetMapping("/sessions/{sessionId}/my-report")
    public ResponseEntity<ApiResponse<Map<String, Object>>> myReport(
            @AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, HttpServletRequest request) {
        return ok(service.myReport(sessionId, userId(user), readGuestCookie(request, sessionId)));
    }

    private ResponseEntity<ApiResponse<Map<String, Object>>> result(SessionEntryService.EntryResult result, HttpServletRequest request, Long sessionId, boolean authenticated) {
        ResponseEntity.BodyBuilder response = ResponseEntity.ok();
        if (result.guestToken() != null && !result.guestToken().isBlank()) {
            response.header(HttpHeaders.SET_COOKIE, guestCookie(request, sessionId, result.guestToken()).toString());
        } else if (authenticated && readGuestCookie(request, sessionId) != null) {
            response.header(HttpHeaders.SET_COOKIE, guestCookie(request, sessionId, "").mutate().maxAge(0).build().toString());
        }
        return response.body(ApiResponse.success("Request completed.", result.data()));
    }

    private ResponseEntity<ApiResponse<Map<String, Object>>> ok(Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.success("Request completed.", data));
    }

    private Long userId(CustomUserDetails user) { return user == null ? null : user.getId(); }
    private String guestCookieName(Long sessionId) { return "sp_guest_session_" + sessionId; }
    private String readGuestCookie(HttpServletRequest request, Long sessionId) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) if (guestCookieName(sessionId).equals(cookie.getName())) return cookie.getValue();
        return null;
    }
    private Map<Long, String> readGuestCookies(HttpServletRequest request) {
        Map<Long, String> result = new HashMap<>();
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return result;
        for (Cookie cookie : cookies) {
            if (!cookie.getName().startsWith("sp_guest_session_")) continue;
            try { result.put(Long.valueOf(cookie.getName().substring("sp_guest_session_".length())), cookie.getValue()); }
            catch (NumberFormatException ignored) { }
        }
        return result;
    }
    private ResponseCookie guestCookie(HttpServletRequest request, Long sessionId, String token) {
        boolean secure = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        return ResponseCookie.from(guestCookieName(sessionId), token).httpOnly(true).secure(secure)
                .sameSite("Lax").path("/").maxAge(GUEST_COOKIE_MAX_AGE).build();
    }
}
