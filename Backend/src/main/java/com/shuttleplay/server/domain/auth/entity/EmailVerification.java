package com.shuttleplay.server.domain.auth.entity;

import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "email_verifications",
        indexes = {
                @Index(name = "idx_email_verifications_email", columnList = "email"),
                @Index(name = "idx_email_verifications_verified", columnList = "verified")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmailVerification extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false)
    private boolean verified;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column
    private LocalDateTime verifiedAt;

    @Builder
    private EmailVerification(
            String email,
            String code,
            boolean verified,
            LocalDateTime expiresAt,
            LocalDateTime verifiedAt
    ) {
        this.email = email;
        this.code = code;
        this.verified = verified;
        this.expiresAt = expiresAt;
        this.verifiedAt = verifiedAt;
    }

    public static EmailVerification create(String email, String code, LocalDateTime expiresAt) {
        return EmailVerification.builder()
                .email(email)
                .code(code)
                .verified(false)
                .expiresAt(expiresAt)
                .verifiedAt(null)
                .build();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public boolean isCodeMismatch(String code) {
        return !this.code.equals(code);
    }

    public void verify() {
        this.verified = true;
        this.verifiedAt = LocalDateTime.now();
    }
}