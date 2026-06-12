package com.shuttleplay.server.domain.auth.dto.response;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.AuthProvider;
import com.shuttleplay.server.domain.user.enums.AgeGroup;
import com.shuttleplay.server.domain.user.enums.Gender;
import com.shuttleplay.server.domain.user.enums.Grade;
import com.shuttleplay.server.domain.user.enums.UserRole;
import lombok.Builder;
import lombok.Getter;

@Getter
public class LoginUserResponse {
    private final Long id;
    private final String name;
    private final String email;
    private final UserRole role;
    private final AuthProvider provider;
    private final boolean profileCompleted;
    private final Gender gender;
    private final AgeGroup ageGroup;
    private final Grade grade;
    private final String profileImageUrl;

    @Builder
    private LoginUserResponse(
            Long id,
            String name,
            String email,
            UserRole role,
            AuthProvider provider,
            boolean profileCompleted,
            Gender gender,
            AgeGroup ageGroup,
            Grade grade,
            String profileImageUrl
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.provider = provider;
        this.profileCompleted = profileCompleted;
        this.gender = gender;
        this.ageGroup = ageGroup;
        this.grade = grade;
        this.profileImageUrl = profileImageUrl;
    }

    public static LoginUserResponse from(User user) {
        return LoginUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .provider(user.getProvider())
                .profileCompleted(user.isProfileCompleted())
                .gender(user.getGender())
                .ageGroup(user.getAgeGroup())
                .grade(user.getGrade())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
