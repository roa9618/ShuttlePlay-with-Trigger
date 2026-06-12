package com.shuttleplay.server.domain.notification.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
public class NotificationListResponse {
    private final List<NotificationItemResponse> items;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final long unreadCount;

    @Builder
    private NotificationListResponse(List<NotificationItemResponse> items, int page, int size,
                                     long totalElements, int totalPages, long unreadCount) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.unreadCount = unreadCount;
    }
}
