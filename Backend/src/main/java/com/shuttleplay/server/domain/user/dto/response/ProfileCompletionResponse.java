package com.shuttleplay.server.domain.user.dto.response;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.AgeGroup;
import com.shuttleplay.server.domain.user.enums.Gender;
import com.shuttleplay.server.domain.user.enums.Grade;

public record ProfileCompletionResponse(
        Long userId,
        String name,
        Gender gender,
        AgeGroup ageGroup,
        Grade grade,
        Integer doublesMmr,
        Integer mixedMmr,
        boolean profileCompleted
) {
    public static ProfileCompletionResponse from(User user) {
        return new ProfileCompletionResponse(
                user.getId(),
                user.getName(),
                user.getGender(),
                user.getAgeGroup(),
                user.getGrade(),
                user.getDoublesMmr(),
                user.getMixedMmr(),
                user.isProfileCompleted()
        );
    }
}