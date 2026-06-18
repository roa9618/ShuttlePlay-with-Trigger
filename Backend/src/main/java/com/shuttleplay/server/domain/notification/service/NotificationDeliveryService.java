package com.shuttleplay.server.domain.notification.service;

import com.shuttleplay.server.domain.notification.dto.response.NotificationItemResponse;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationDeliveryService {
    private final SimpMessagingTemplate messagingTemplate;
    private final WebPushService webPushService;

    @Async("notificationTaskExecutor")
    public void dispatch(Long userId, String email, NotificationItemResponse response) {
        try {
            messagingTemplate.convertAndSendToUser(email, "/queue/notifications", response);
            messagingTemplate.convertAndSend("/topic/admin", Map.of("domain", "NOTIFICATION", "type", "DISPATCHED"));
        } catch (RuntimeException exception) {
            log.warn("WebSocket notification delivery failed for user {}", userId, exception);
        }

        try {
            webPushService.send(userId, response);
        } catch (RuntimeException | LinkageError exception) {
            log.warn("Web push notification delivery failed for user {}", userId, exception);
        }
    }
}
