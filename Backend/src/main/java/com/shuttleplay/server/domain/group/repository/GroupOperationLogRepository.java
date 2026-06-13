package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupOperationLog;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import java.util.Optional;

public interface GroupOperationLogRepository extends JpaRepository<GroupOperationLog, Long> {
    @EntityGraph(attributePaths = {"actor", "actor.user"})
    Page<GroupOperationLog> findAllByGroupIdOrderByCreatedAtDesc(Long groupId, Pageable pageable);

    @EntityGraph(attributePaths = {"actor", "actor.user"})
    Optional<GroupOperationLog> findFirstByGroupIdAndActionOrderByCreatedAtDesc(Long groupId, String action);
}
