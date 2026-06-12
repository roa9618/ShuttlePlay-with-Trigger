package com.shuttleplay.server.domain.group.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
public class GroupListResponse {
    private final List<GroupListItemResponse> items;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;

    @Builder
    private GroupListResponse(
            List<GroupListItemResponse> items,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }
}
