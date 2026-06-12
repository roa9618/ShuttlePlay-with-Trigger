package com.shuttleplay.server.domain.notification.entity;

import com.shuttleplay.server.domain.notification.enums.NotificationType;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_notifications_user_created_at", columnList = "user_id,created_at"),
                @Index(name = "idx_notifications_user_is_read", columnList = "user_id,is_read")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationType type;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false, length = 500)
    private String targetPath;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Column
    private LocalDateTime readAt;

    @Builder
    private Notification(User user, NotificationType type, String title, String message,
                         String targetPath, boolean read, LocalDateTime readAt) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.message = message;
        this.targetPath = targetPath;
        this.read = read;
        this.readAt = readAt;
    }

    public void markAsRead() {
        if (!read) {
            read = true;
            readAt = LocalDateTime.now();
        }
    }
}
