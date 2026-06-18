package com.shuttleplay.server.domain.admin.controller;

import com.shuttleplay.server.domain.admin.service.AdminDashboardService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.shuttleplay.server.domain.user.enums.UserRole;
import com.shuttleplay.server.domain.user.enums.UserStatus;
import com.shuttleplay.server.domain.group.enums.GroupStatus;
import com.shuttleplay.server.domain.inquiry.enums.InquiryStatus;
import com.shuttleplay.server.domain.inquiry.enums.InquiryCategory;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {
    private final AdminDashboardService service;

    @GetMapping("/{section}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> section(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String section,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus userStatus,
            @RequestParam(required = false) InquiryStatus inquiryStatus,
            @RequestParam(required = false) InquiryCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success("Request completed.", service.section(user.getId(), section, keyword, role, userStatus, inquiryStatus, category, page, size)));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> userDetail(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Request completed.", service.userDetail(user.getId(), userId)));
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateRole(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long userId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Request completed.", service.updateUserRole(user.getId(), userId, UserRole.valueOf(body.get("role")))));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStatus(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long userId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Request completed.", service.updateUserStatus(user.getId(), userId, UserStatus.valueOf(body.get("status")))));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long userId) {
        service.deleteUser(user.getId(), userId);
        return ResponseEntity.ok(ApiResponse.success("Request completed.", null));
    }

    @PatchMapping("/groups/{groupId}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateGroupStatus(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long groupId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Request completed.", service.updateGroupStatus(user.getId(), groupId, GroupStatus.valueOf(body.get("status")))));
    }

    @PatchMapping("/sessions/{sessionId}/cancel")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cancelSession(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.success("Request completed.", service.cancelSession(user.getId(), sessionId)));
    }

    @PatchMapping("/matches/{matchId}/invalidate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> invalidateMatch(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long matchId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Request completed.", service.invalidateMatch(user.getId(), matchId, body.get("reason"))));
    }

    @PatchMapping("/inquiries/{inquiryId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateInquiry(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long inquiryId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Request completed.", service.updateInquiry(user.getId(), inquiryId, InquiryStatus.valueOf(body.get("status")), body.get("memo"))));
    }

    @PostMapping("/notifications/test")
    public ResponseEntity<ApiResponse<Void>> testNotification(@AuthenticationPrincipal CustomUserDetails user) {
        service.sendTestNotification(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Request completed.", null));
    }
}
