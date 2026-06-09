package com.shuttleplay.server.domain.auth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
public class PasswordResetConfirmResponse {
    private final String email;
    private final boolean resetCompleted;

    @Builder
    private PasswordResetConfirmResponse(String email, boolean resetCompleted) {
        this.email = email;
        this.resetCompleted = resetCompleted;
    }

    public static PasswordResetConfirmResponse of(String email, boolean resetCompleted) {
        return PasswordResetConfirmResponse.builder()
                .email(email)
                .resetCompleted(resetCompleted)
                .build();
    }
}