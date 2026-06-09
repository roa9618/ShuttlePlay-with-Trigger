package com.shuttleplay.server.domain.auth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
public class CheckEmailResponse {
    private final boolean available;

    @Builder
    private CheckEmailResponse(boolean available) {
        this.available = available;
    }

    public static CheckEmailResponse of(boolean available) {
        return CheckEmailResponse.builder()
                .available(available)
                .build();
    }
}