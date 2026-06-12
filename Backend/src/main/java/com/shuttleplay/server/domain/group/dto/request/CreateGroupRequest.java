package com.shuttleplay.server.domain.group.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CreateGroupRequest {
    @NotBlank
    @Size(max = 40)
    private String name;

    @Size(max = 500)
    private String profileImageUrl;

    @NotBlank
    @Size(max = 100)
    private String activityRegion;

    @NotBlank
    @Size(max = 60)
    private String description;

    @Size(max = 150)
    private String operationNotice;
}
