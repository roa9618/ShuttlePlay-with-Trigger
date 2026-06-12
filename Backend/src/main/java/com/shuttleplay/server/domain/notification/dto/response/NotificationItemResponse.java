package com.shuttleplay.server.domain.notification.dto.response;

import com.shuttleplay.server.domain.notification.entity.Notification;
import com.shuttleplay.server.domain.notification.enums.NotificationType;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
public class NotificationItemResponse {
    private final Long id;
    private final NotificationType type;
    private final String title;
    private final String message;
    private final String targetPath;
    private final boolean read;
    private final LocalDateTime createdAt;

    @Builder
    private NotificationItemResponse(Long id, NotificationType type, String title, String message,
                                     String targetPath, boolean read, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.targetPath = targetPath;
        this.read = read;
        this.createdAt = createdAt;
    }

    public static NotificationItemResponse from(Notification notification) {
        return NotificationItemResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .targetPath(notification.getTargetPath())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
