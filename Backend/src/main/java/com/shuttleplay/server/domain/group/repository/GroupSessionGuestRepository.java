package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupSessionGuest;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupSessionGuestRepository extends JpaRepository<GroupSessionGuest, Long> {
    Optional<GroupSessionGuest> findByIdAndSessionId(Long id, Long sessionId);
    List<GroupSessionGuest> findAllBySessionId(Long sessionId);
    boolean existsBySessionIdAndNameIgnoreCase(Long sessionId, String name);
    boolean existsBySessionIdAndNameIgnoreCaseAndIdNot(Long sessionId, String name, Long id);
}
