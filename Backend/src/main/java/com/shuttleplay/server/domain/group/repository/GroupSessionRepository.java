package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupSession;
import com.shuttleplay.server.domain.group.enums.GroupSessionStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupSessionRepository extends JpaRepository<GroupSession, Long> {
    @EntityGraph(attributePaths = {"group"})
    List<GroupSession> findAllByGroupIdInAndStartsAtBetweenAndStatusNot(
            Collection<Long> groupIds,
            LocalDateTime startsAtFrom,
            LocalDateTime startsAtTo,
            GroupSessionStatus excludedStatus
    );

    List<GroupSession> findAllByGroupIdAndStartsAtBetweenAndStatusNot(
            Long groupId,
            LocalDateTime startsAtFrom,
            LocalDateTime startsAtTo,
            GroupSessionStatus excludedStatus
    );
}
