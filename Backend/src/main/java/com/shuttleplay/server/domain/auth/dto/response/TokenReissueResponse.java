package com.shuttleplay.server.domain.auth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
public class TokenReissueResponse {
    private final String accessToken;
    private final String refreshToken;
    private final String tokenType;
    private final long expiresIn;
    private final long refreshTokenExpiresIn;

    @Builder
    private TokenReissueResponse(
            String accessToken,
            String refreshToken,
            String tokenType,
            long expiresIn,
            long refreshTokenExpiresIn
    ) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.refreshTokenExpiresIn = refreshTokenExpiresIn;
    }

    public static TokenReissueResponse of(
            String accessToken,
            String refreshToken,
            long expiresIn,
            long refreshTokenExpiresIn
    ) {
        return TokenReissueResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .refreshTokenExpiresIn(refreshTokenExpiresIn)
                .build();
    }
}