package com.shuttleplay.server.domain.group.controller;

import com.shuttleplay.server.domain.group.service.SessionGuestJoinService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import java.util.Map;
import lombok.RequiredArgsConstructor;
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
    private final SessionGuestJoinService service;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> preview(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long sessionId
    ) {
        Long userId = user == null ? null : user.getId();
        return ResponseEntity.ok(ApiResponse.success("Request completed.", service.preview(sessionId, userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> submit(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long sessionId,
            @RequestBody Map<String, Object> body
    ) {
        Long userId = user == null ? null : user.getId();
        return ResponseEntity.ok(ApiResponse.success("Request completed.", service.submit(sessionId, userId, body)));
    }
}
