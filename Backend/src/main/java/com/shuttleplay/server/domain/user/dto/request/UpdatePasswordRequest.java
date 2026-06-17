package com.shuttleplay.server.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdatePasswordRequest(
        @NotBlank(message = "현재 비밀번호는 필수입니다.")
        String currentPassword,

        @NotBlank(message = "새 비밀번호는 필수입니다.")
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
                message = "비밀번호는 영문과 숫자를 포함해 8자 이상이어야 합니다."
        )
        String newPassword,

        @NotBlank(message = "새 비밀번호 확인은 필수입니다.")
        String newPasswordConfirm
) {
}
