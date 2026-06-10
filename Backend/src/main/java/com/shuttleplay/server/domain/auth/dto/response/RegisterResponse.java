package com.shuttleplay.server.domain.auth.dto.response;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.Grade;
import lombok.Builder;
import lombok.Getter;

@Getter
public class RegisterResponse {
    private final Long userId;
    private final String email;
    private final String name;
    private final Grade grade;
    private final Integer doublesMmr;
    private final Integer mixedMmr;
    private final boolean termsAgreed;
    private final boolean privacyPolicyAgreed;

    @Builder
    private RegisterResponse(
            Long userId,
            String email,
            String name,
            Grade grade,
            Integer doublesMmr,
            Integer mixedMmr,
            boolean termsAgreed,
            boolean privacyPolicyAgreed
    ) {
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.grade = grade;
        this.doublesMmr = doublesMmr;
        this.mixedMmr = mixedMmr;
        this.termsAgreed = termsAgreed;
        this.privacyPolicyAgreed = privacyPolicyAgreed;
    }

    public static RegisterResponse from(User user) {
        return RegisterResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .grade(user.getGrade())
                .doublesMmr(user.getDoublesMmr())
                .mixedMmr(user.getMixedMmr())
                .termsAgreed(user.isTermsAgreed())
                .privacyPolicyAgreed(user.isPrivacyPolicyAgreed())
                .build();
    }
}