package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupSessionGuest;
import com.shuttleplay.server.domain.group.enums.GroupSessionStatus;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupSessionGuestRepository extends JpaRepository<GroupSessionGuest, Long> {
    Optional<GroupSessionGuest> findByIdAndSessionId(Long id, Long sessionId);
    List<GroupSessionGuest> findAllBySessionId(Long sessionId);
    List<GroupSessionGuest> findAllBySession_Group_IdAndSession_StatusAndSession_IsDeletedFalseOrderBySession_StartsAtDesc(Long groupId, GroupSessionStatus status);
    boolean existsBySessionIdAndNameIgnoreCase(Long sessionId, String name);
    boolean existsBySessionIdAndNameIgnoreCaseAndIdNot(Long sessionId, String name, Long id);
}
