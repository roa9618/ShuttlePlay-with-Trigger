package com.shuttleplay.server.domain.group.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
public class GroupImageUploadResponse {
    private final String imageUrl;

    @Builder
    private GroupImageUploadResponse(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public static GroupImageUploadResponse of(String imageUrl) {
        return GroupImageUploadResponse.builder()
                .imageUrl(imageUrl)
                .build();
    }
}
