package com.shuttleplay.server.domain.user.entity;

import com.shuttleplay.server.domain.user.enums.AgeGroup;
import com.shuttleplay.server.domain.user.enums.AuthProvider;
import com.shuttleplay.server.domain.user.enums.Gender;
import com.shuttleplay.server.domain.user.enums.Grade;
import com.shuttleplay.server.domain.user.enums.UserRole;
import com.shuttleplay.server.domain.user.enums.UserStatus;
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
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_users_email",
                        columnNames = {"email"}
                ),
                @UniqueConstraint(
                        name = "uk_users_provider_provider_id",
                        columnNames = {"provider", "provider_id"}
                )
        },
        indexes = {
                @Index(name = "idx_users_status", columnList = "status")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private AgeGroup ageGroup;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Grade grade;

    @Column(nullable = false)
    private Integer doublesMmr;

    @Column(nullable = false)
    private Integer mixedMmr;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuthProvider provider;

    @Column(name = "provider_id", length = 100)
    private String providerId;

    @Column(length = 500)
    private String profileImageUrl;

    @Column(nullable = false)
    private boolean profileCompleted;

    @Builder
    private User(
            String email,
            String password,
            String name,
            Gender gender,
            AgeGroup ageGroup,
            Grade grade,
            Integer doublesMmr,
            Integer mixedMmr,
            UserRole role,
            UserStatus status,
            AuthProvider provider,
            String providerId,
            String profileImageUrl,
            boolean profileCompleted
    ) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.gender = gender;
        this.ageGroup = ageGroup;
        this.grade = grade;
        this.doublesMmr = doublesMmr;
        this.mixedMmr = mixedMmr;
        this.role = role;
        this.status = status;
        this.provider = provider;
        this.providerId = providerId;
        this.profileImageUrl = profileImageUrl;
        this.profileCompleted = profileCompleted;
    }

    public static User createLocalUser(
            String email,
            String encodedPassword,
            String name,
            Gender gender,
            AgeGroup ageGroup,
            Grade grade,
            int initialMmr
    ) {
        return User.builder()
                .email(email)
                .password(encodedPassword)
                .name(name)
                .gender(gender)
                .ageGroup(ageGroup)
                .grade(grade)
                .doublesMmr(initialMmr)
                .mixedMmr(initialMmr)
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .provider(AuthProvider.LOCAL)
                .providerId(null)
                .profileImageUrl(null)
                .profileCompleted(true)
                .build();
    }

    public static User createSocialUser(
            String email,
            String name,
            AuthProvider provider,
            String providerId,
            String profileImageUrl
    ) {
        return User.builder()
                .email(email)
                .password(null)
                .name(name)
                .gender(null)
                .ageGroup(null)
                .grade(null)
                .doublesMmr(0)
                .mixedMmr(0)
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .provider(provider)
                .providerId(providerId)
                .profileImageUrl(profileImageUrl)
                .profileCompleted(false)
                .build();
    }

    public void completeProfile(
            String name,
            Gender gender,
            AgeGroup ageGroup,
            Grade grade,
            int initialMmr
    ) {
        this.name = name;
        this.gender = gender;
        this.ageGroup = ageGroup;
        this.grade = grade;
        this.doublesMmr = initialMmr;
        this.mixedMmr = initialMmr;
        this.profileCompleted = true;
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void deactivate() {
        this.status = UserStatus.INACTIVE;
    }

    public void deleteUser() {
        this.status = UserStatus.DELETED;
        softDelete();
    }

    public boolean isLocalAccount() {
        return this.provider == AuthProvider.LOCAL;
    }

    public boolean isActive() {
        return this.status == UserStatus.ACTIVE && !isDeleted();
    }
}