package com.shuttleplay.server.domain.notification.entity;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "push_subscriptions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_push_subscriptions_endpoint_hash", columnNames = "endpoint_hash")
        },
        indexes = {
                @Index(name = "idx_push_subscriptions_user", columnList = "user_id")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PushSubscription extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String endpoint;

    @Column(name = "endpoint_hash", nullable = false, length = 64)
    private String endpointHash;

    @Column(nullable = false, length = 255)
    private String p256dh;

    @Column(nullable = false, length = 255)
    private String auth;

    private PushSubscription(User user, String endpoint, String endpointHash, String p256dh, String auth) {
        this.user = user;
        this.endpoint = endpoint;
        this.endpointHash = endpointHash;
        this.p256dh = p256dh;
        this.auth = auth;
    }

    public static PushSubscription create(
            User user,
            String endpoint,
            String endpointHash,
            String p256dh,
            String auth
    ) {
        return new PushSubscription(user, endpoint, endpointHash, p256dh, auth);
    }

    public void update(User user, String endpoint, String endpointHash, String p256dh, String auth) {
        this.user = user;
        this.endpoint = endpoint;
        this.endpointHash = endpointHash;
        this.p256dh = p256dh;
        this.auth = auth;
    }
}
