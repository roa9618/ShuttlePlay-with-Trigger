package com.shuttleplay.server.domain.auth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
public class EmailVerificationConfirmResponse {
    private final String email;
    private final boolean verified;

    @Builder
    private EmailVerificationConfirmResponse(String email, boolean verified) {
        this.email = email;
        this.verified = verified;
    }

    public static EmailVerificationConfirmResponse of(String email, boolean verified) {
        return EmailVerificationConfirmResponse.builder()
                .email(email)
                .verified(verified)
                .build();
    }
}