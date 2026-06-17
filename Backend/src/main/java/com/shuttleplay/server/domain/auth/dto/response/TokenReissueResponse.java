package com.shuttleplay.server.domain.auth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
public class TokenReissueResponse {
    private final String accessToken;
    private final String tokenType;
    private final long expiresIn;
    private final long refreshTokenExpiresIn;
    private final LoginUserResponse user;

    @Builder
    private TokenReissueResponse(
            String accessToken,
            String tokenType,
            long expiresIn,
            long refreshTokenExpiresIn,
            LoginUserResponse user
    ) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.refreshTokenExpiresIn = refreshTokenExpiresIn;
        this.user = user;
    }

    public static TokenReissueResponse of(
            String accessToken,
            long expiresIn,
            long refreshTokenExpiresIn,
            LoginUserResponse user
    ) {
        return TokenReissueResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .refreshTokenExpiresIn(refreshTokenExpiresIn)
                .user(user)
                .build();
    }
}