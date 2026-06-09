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

    @Builder
    private RegisterResponse(
            Long userId,
            String email,
            String name,
            Grade grade,
            Integer doublesMmr,
            Integer mixedMmr
    ) {
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.grade = grade;
        this.doublesMmr = doublesMmr;
        this.mixedMmr = mixedMmr;
    }

    public static RegisterResponse from(User user) {
        return RegisterResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .grade(user.getGrade())
                .doublesMmr(user.getDoublesMmr())
                .mixedMmr(user.getMixedMmr())
                .build();
    }
}