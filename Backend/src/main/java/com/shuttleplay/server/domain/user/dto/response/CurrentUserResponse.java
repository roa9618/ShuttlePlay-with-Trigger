package com.shuttleplay.server.domain.user.dto.response;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.AgeGroup;
import com.shuttleplay.server.domain.user.enums.AuthProvider;
import com.shuttleplay.server.domain.user.enums.Gender;
import com.shuttleplay.server.domain.user.enums.Grade;
import com.shuttleplay.server.domain.user.enums.UserRole;
import com.shuttleplay.server.domain.user.enums.UserStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
public class CurrentUserResponse {
    private final Long id;
    private final String email;
    private final String name;
    private final Gender gender;
    private final AgeGroup ageGroup;
    private final Grade grade;
    private final int doublesMmr;
    private final int mixedMmr;
    private final UserRole role;
    private final UserStatus status;
    private final AuthProvider provider;
    private final String profileImageUrl;
    private final boolean profileCompleted;

    @Builder
    private CurrentUserResponse(
            Long id,
            String email,
            String name,
            Gender gender,
            AgeGroup ageGroup,
            Grade grade,
            int doublesMmr,
            int mixedMmr,
            UserRole role,
            UserStatus status,
            AuthProvider provider,
            String profileImageUrl,
            boolean profileCompleted
    ) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.gender = gender;
        this.ageGroup = ageGroup;
        this.grade = grade;
        this.doublesMmr = doublesMmr;
        this.mixedMmr = mixedMmr;
        this.role = role;
        this.status = status;
        this.provider = provider;
        this.profileImageUrl = profileImageUrl;
        this.profileCompleted = profileCompleted;
    }

    public static CurrentUserResponse from(User user) {
        return CurrentUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .gender(user.getGender())
                .ageGroup(user.getAgeGroup())
                .grade(user.getGrade())
                .doublesMmr(user.getDoublesMmr())
                .mixedMmr(user.getMixedMmr())
                .role(user.getRole())
                .status(user.getStatus())
                .provider(user.getProvider())
                .profileImageUrl(user.getProfileImageUrl())
                .profileCompleted(user.isProfileCompleted())
                .build();
    }
}