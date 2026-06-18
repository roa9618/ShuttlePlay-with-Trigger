package com.shuttleplay.server.domain.notice.controller;

import com.shuttleplay.server.domain.notice.service.NoticeService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {
    private final NoticeService service;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> list(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) { return ok(service.list(keyword, page, size)); }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> detail(@PathVariable Long id) { return ok(service.detail(id)); }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@AuthenticationPrincipal CustomUserDetails user, @RequestBody Map<String, Object> body) {
        return ok(service.create(user.getId(), body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> update(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        service.update(user.getId(), id, body); return done();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long id) {
        service.delete(user.getId(), id); return done();
    }

    private static <T> ResponseEntity<ApiResponse<T>> ok(T data) { return ResponseEntity.ok(ApiResponse.success("Request completed.", data)); }
    private static ResponseEntity<ApiResponse<Void>> done() { return ResponseEntity.ok(ApiResponse.success("Request completed.", null)); }
}
