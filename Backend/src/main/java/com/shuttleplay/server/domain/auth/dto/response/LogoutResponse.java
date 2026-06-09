package com.shuttleplay.server.domain.auth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
public class LogoutResponse {
    private final Long userId;

    @Builder
    private LogoutResponse(Long userId) {
        this.userId = userId;
    }

    public static LogoutResponse of(Long userId) {
        return LogoutResponse.builder()
                .userId(userId)
                .build();
    }
}