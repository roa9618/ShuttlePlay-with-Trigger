package com.shuttleplay.server.domain.notification.controller;

import com.shuttleplay.server.domain.notification.dto.response.NotificationItemResponse;
import com.shuttleplay.server.domain.notification.dto.response.NotificationListResponse;
import com.shuttleplay.server.domain.notification.dto.request.PushSubscriptionRequest;
import com.shuttleplay.server.domain.notification.dto.request.PushUnsubscribeRequest;
import com.shuttleplay.server.domain.notification.dto.response.WebPushConfigResponse;
import com.shuttleplay.server.domain.notification.service.NotificationService;
import com.shuttleplay.server.domain.notification.service.WebPushService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final WebPushService webPushService;

    @GetMapping("/push/config")
    public ResponseEntity<ApiResponse<WebPushConfigResponse>> getWebPushConfig() {
        return ResponseEntity.ok(ApiResponse.success(
                "웹 푸시 설정을 조회했습니다.",
                webPushService.getConfig()
        ));
    }

    @PostMapping("/push/subscriptions")
    public ResponseEntity<ApiResponse<Void>> subscribe(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PushSubscriptionRequest request
    ) {
        webPushService.subscribe(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("시스템 알림 구독을 등록했습니다."));
    }

    @DeleteMapping("/push/subscriptions")
    public ResponseEntity<ApiResponse<Void>> unsubscribe(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PushUnsubscribeRequest request
    ) {
        webPushService.unsubscribe(userDetails.getId(), request.endpoint());
        return ResponseEntity.ok(ApiResponse.success("시스템 알림 구독을 해제했습니다."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<NotificationListResponse>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        NotificationListResponse response = notificationService.getNotifications(
                userDetails.getId(), unreadOnly, page, size
        );
        return ResponseEntity.ok(ApiResponse.success("알림 목록을 조회했습니다.", response));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationItemResponse>> markAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long notificationId
    ) {
        NotificationItemResponse response = notificationService.markAsRead(
                userDetails.getId(), notificationId
        );
        return ResponseEntity.ok(ApiResponse.success("알림을 읽음 처리했습니다.", response));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        notificationService.markAllAsRead(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("모든 알림을 읽음 처리했습니다."));
    }
}
