package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.SessionParticipantRelation;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionParticipantRelationRepository extends JpaRepository<SessionParticipantRelation, Long> {
    @EntityGraph(attributePaths = {"firstAttendance", "firstAttendance.member", "firstAttendance.member.user", "firstAttendance.guest", "secondAttendance", "secondAttendance.member", "secondAttendance.member.user", "secondAttendance.guest"})
    List<SessionParticipantRelation> findAllBySessionIdAndIsDeletedFalseOrderByIdAsc(Long sessionId);
}
