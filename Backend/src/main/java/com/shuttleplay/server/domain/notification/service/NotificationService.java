package com.shuttleplay.server.domain.notification.service;

import com.shuttleplay.server.domain.notification.dto.response.NotificationItemResponse;
import com.shuttleplay.server.domain.notification.dto.response.NotificationListResponse;
import com.shuttleplay.server.domain.notification.entity.Notification;
import com.shuttleplay.server.domain.notification.enums.NotificationType;
import com.shuttleplay.server.domain.notification.enums.NotificationPreferenceType;
import com.shuttleplay.server.domain.notification.repository.NotificationRepository;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.entity.UserNotificationSettings;
import com.shuttleplay.server.domain.user.repository.UserNotificationSettingsRepository;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationDeliveryService notificationDeliveryService;
    private final UserNotificationSettingsRepository notificationSettingsRepository;

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

        NotificationItemResponse response = NotificationItemResponse.from(notification);
        Runnable dispatch = () -> dispatch(user, response);

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    dispatch.run();
                }
            });
            return;
        }

        dispatch.run();
    }

    @Transactional
    public void sendIfEnabled(
            User user,
            NotificationType type,
            String title,
            String message,
            String targetPath,
            NotificationPreferenceType preferenceType
    ) {
        if (!isEnabled(user.getId(), preferenceType)) {
            return;
        }

        send(user, type, title, message, targetPath);
    }

    private boolean isEnabled(Long userId, NotificationPreferenceType preferenceType) {
        return notificationSettingsRepository.findByUserId(userId)
                .map(settings -> isEnabled(settings, preferenceType))
                .orElse(true);
    }

    private boolean isEnabled(UserNotificationSettings settings, NotificationPreferenceType preferenceType) {
        return switch (preferenceType) {
            case NEXT_MATCH -> settings.isNextMatchEnabled();
            case MATCH_START -> settings.isMatchStartEnabled();
            case COURT_CHANGE -> settings.isCourtChangeEnabled();
            case RESULT_REQUEST -> settings.isResultRequestEnabled();
            case SCHEDULE_CHANGE -> settings.isScheduleChangeEnabled();
        };
    }

    private void dispatch(User user, NotificationItemResponse response) {
        try {
            notificationDeliveryService.dispatch(user.getId(), user.getEmail(), response);
        } catch (RuntimeException exception) {
            log.warn("Notification delivery task submission failed for user {}", user.getId(), exception);
        }
    }
}
