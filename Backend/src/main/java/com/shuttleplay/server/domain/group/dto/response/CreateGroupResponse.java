package com.shuttleplay.server.domain.group.dto.response;

import com.shuttleplay.server.domain.group.entity.Group;
import lombok.Builder;
import lombok.Getter;

@Getter
public class CreateGroupResponse {
    private final Long id;
    private final String name;

    @Builder
    private CreateGroupResponse(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public static CreateGroupResponse from(Group group) {
        return CreateGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .build();
    }
}
