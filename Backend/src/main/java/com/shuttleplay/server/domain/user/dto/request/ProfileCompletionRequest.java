package com.shuttleplay.server.domain.user.dto.request;

import com.shuttleplay.server.domain.user.enums.AgeGroup;
import com.shuttleplay.server.domain.user.enums.Gender;
import com.shuttleplay.server.domain.user.enums.Grade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProfileCompletionRequest(
        @NotBlank(message = "이름은 필수입니다.")
        @Size(max = 50, message = "이름은 50자 이하로 입력해주세요.")
        String name,

        @NotNull(message = "성별은 필수입니다.")
        Gender gender,

        @NotNull(message = "나이대는 필수입니다.")
        AgeGroup ageGroup,

        @NotNull(message = "급수는 필수입니다.")
        Grade grade
) {
}