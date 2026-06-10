package com.shuttleplay.server.domain.user.dto.response;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.AgeGroup;
import com.shuttleplay.server.domain.user.enums.Gender;
import com.shuttleplay.server.domain.user.enums.Grade;

public record ProfileCompletionFormResponse(
        String name,
        Gender gender,
        AgeGroup ageGroup,
        Grade grade,
        boolean profileCompleted
) {
    public static ProfileCompletionFormResponse from(User user) {
        return new ProfileCompletionFormResponse(
                user.getName(),
                user.getGender(),
                user.getAgeGroup(),
                user.getGrade(),
                user.isProfileCompleted()
        );
    }
}