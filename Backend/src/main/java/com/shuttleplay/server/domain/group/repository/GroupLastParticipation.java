package com.shuttleplay.server.domain.group.repository;

import java.time.LocalDateTime;

public interface GroupLastParticipation {
    Long getGroupId();
    LocalDateTime getLastParticipationAt();
}
