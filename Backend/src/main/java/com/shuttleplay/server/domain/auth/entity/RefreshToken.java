package com.shuttleplay.server.domain.auth.entity;

import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "refresh_tokens")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true, length = 512)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean revoked;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean persistent;

    private RefreshToken(Long userId, String token, LocalDateTime expiresAt, boolean persistent) {
        this.userId = userId;
        this.token = token;
        this.expiresAt = expiresAt;
        this.revoked = false;
        this.persistent = persistent;
    }

    public static RefreshToken create(Long userId, String token, LocalDateTime expiresAt, boolean persistent) {
        return new RefreshToken(userId, token, expiresAt, persistent);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isInvalid() {
        return revoked || isExpired();
    }

    public void revoke() {
        this.revoked = true;
    }
}
