package com.shuttleplay.server.domain.notification.service;

import com.shuttleplay.server.domain.notification.dto.response.NotificationItemResponse;
import com.shuttleplay.server.domain.notification.dto.response.NotificationListResponse;
import com.shuttleplay.server.domain.notification.entity.Notification;
import com.shuttleplay.server.domain.notification.repository.NotificationRepository;
import com.shuttleplay.server.domain.notification.enums.NotificationType;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationListResponse getNotifications(Long userId, boolean unreadOnly, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Notification> notifications = unreadOnly
                ? notificationRepository.findAllByUserIdAndReadFalseOrderByCreatedAtDesc(userId, pageRequest)
                : notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageRequest);

        return NotificationListResponse.builder()
                .items(notifications.stream().map(NotificationItemResponse::from).toList())
                .page(notifications.getNumber())
                .size(notifications.getSize())
                .totalElements(notifications.getTotalElements())
                .totalPages(notifications.getTotalPages())
                .unreadCount(notificationRepository.countByUserIdAndReadFalse(userId))
                .build();
    }

    @Transactional
    public NotificationItemResponse markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));
        notification.markAsRead();
        return NotificationItemResponse.from(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findAllByUserIdAndReadFalse(userId);
        notifications.forEach(Notification::markAsRead);
    }

    @Transactional
    public void send(User user, NotificationType type, String title, String message, String targetPath) {
        Notification notification = notificationRepository.saveAndFlush(
                Notification.create(user, type, title, message, targetPath)
        );

        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                NotificationItemResponse.from(notification)
        );
    }
}
