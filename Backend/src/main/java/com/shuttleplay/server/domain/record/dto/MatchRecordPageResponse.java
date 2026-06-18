package com.shuttleplay.server.domain.record.dto;

import java.util.List;

public record MatchRecordPageResponse(
        List<MyRecordSummaryResponse.MatchItem> items,
        int page,
        int size,
        long totalElements,
        int totalPages
) {}
