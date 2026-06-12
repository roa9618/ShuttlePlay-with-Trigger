package com.shuttleplay.server.domain.inquiry.entity;

import com.shuttleplay.server.domain.inquiry.enums.InquiryCategory;
import com.shuttleplay.server.domain.inquiry.enums.InquiryStatus;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
        name = "inquiries",
        indexes = {
                @Index(name = "idx_inquiries_status_created_at", columnList = "status,created_at"),
                @Index(name = "idx_inquiries_email", columnList = "email")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inquiry extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InquiryCategory category;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 100)
    private String subject;

    @Column(nullable = false, length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InquiryStatus status;

    @Column(nullable = false)
    private LocalDateTime privacyAgreedAt;

    @Builder
    private Inquiry(InquiryCategory category, String name, String email, String subject,
                    String message, InquiryStatus status, LocalDateTime privacyAgreedAt) {
        this.category = category;
        this.name = name;
        this.email = email;
        this.subject = subject;
        this.message = message;
        this.status = status;
        this.privacyAgreedAt = privacyAgreedAt;
    }

    public static Inquiry create(InquiryCategory category, String name, String email,
                                 String subject, String message) {
        return Inquiry.builder()
                .category(category)
                .name(name)
                .email(email)
                .subject(subject)
                .message(message)
                .status(InquiryStatus.RECEIVED)
                .privacyAgreedAt(LocalDateTime.now())
                .build();
    }
}
