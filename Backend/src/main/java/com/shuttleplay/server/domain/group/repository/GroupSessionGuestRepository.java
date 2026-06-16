package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupSessionGuest;
import com.shuttleplay.server.domain.group.enums.GroupSessionStatus;
import com.shuttleplay.server.domain.group.enums.SessionVoteStatus;
import com.shuttleplay.server.domain.user.enums.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupSessionGuestRepository extends JpaRepository<GroupSessionGuest, Long> {
    Optional<GroupSessionGuest> findByIdAndSessionId(Long id, Long sessionId);
    List<GroupSessionGuest> findAllBySessionId(Long sessionId);
    List<GroupSessionGuest> findAllBySession_Group_IdAndSession_StatusAndSession_IsDeletedFalseOrderBySession_StartsAtDesc(Long groupId, GroupSessionStatus status);
    Optional<GroupSessionGuest> findBySessionIdAndNameIgnoreCaseAndGenderAndAgeGroupAndGrade(Long sessionId, String name, Gender gender, AgeGroup ageGroup, Grade grade);
    boolean existsBySessionIdAndNameIgnoreCase(Long sessionId, String name);
    boolean existsBySessionIdAndNameIgnoreCaseAndIdNot(Long sessionId, String name, Long id);
    long countBySessionIdAndStatus(Long sessionId, SessionVoteStatus status);
}
