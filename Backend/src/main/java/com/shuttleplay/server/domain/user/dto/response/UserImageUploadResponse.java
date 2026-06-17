package com.shuttleplay.server.domain.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
public class UserImageUploadResponse {
    private final String imageUrl;

    @Builder
    private UserImageUploadResponse(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public static UserImageUploadResponse of(String imageUrl) {
        return UserImageUploadResponse.builder()
                .imageUrl(imageUrl)
                .build();
    }
}
