package com.shuttleplay.server.domain.record.dto;

import java.time.LocalDateTime;
import java.util.List;

public record MmrHistoryResponse(String type, int currentMmr, int totalChange, List<Point> points) {
    public record Point(Long id, LocalDateTime changedAt, int beforeMmr, int afterMmr, int change) {}
}
