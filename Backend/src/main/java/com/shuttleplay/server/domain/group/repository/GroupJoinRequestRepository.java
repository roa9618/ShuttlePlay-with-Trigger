package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupJoinRequest;
import com.shuttleplay.server.domain.group.enums.JoinRequestStatus;
import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;

public interface GroupJoinRequestRepository extends JpaRepository<GroupJoinRequest, Long> {
    @EntityGraph(attributePaths = {"requester"})
    Page<GroupJoinRequest> findAllByGroupIdAndStatusOrderByCreatedAtDesc(Long groupId, JoinRequestStatus status, Pageable pageable);
    List<GroupJoinRequest> findAllByGroupIdAndStatus(Long groupId, JoinRequestStatus status);
    Optional<GroupJoinRequest> findByIdAndGroupIdAndStatus(Long id, Long groupId, JoinRequestStatus status);
}
