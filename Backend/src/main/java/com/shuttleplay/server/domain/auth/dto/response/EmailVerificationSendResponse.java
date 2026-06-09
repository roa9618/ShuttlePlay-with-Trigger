package com.shuttleplay.server.domain.auth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
public class EmailVerificationSendResponse {
    private final String email;
    private final int expiresInMinutes;

    @Builder
    private EmailVerificationSendResponse(String email, int expiresInMinutes) {
        this.email = email;
        this.expiresInMinutes = expiresInMinutes;
    }

    public static EmailVerificationSendResponse of(String email, int expiresInMinutes) {
        return EmailVerificationSendResponse.builder()
                .email(email)
                .expiresInMinutes(expiresInMinutes)
                .build();
    }
}