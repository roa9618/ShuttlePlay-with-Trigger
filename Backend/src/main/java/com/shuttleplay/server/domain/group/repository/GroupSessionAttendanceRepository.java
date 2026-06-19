package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupSessionAttendance;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupSessionAttendanceRepository extends JpaRepository<GroupSessionAttendance, Long> {
    Optional<GroupSessionAttendance> findBySessionIdAndMemberId(Long sessionId, Long memberId);
    Optional<GroupSessionAttendance> findBySessionIdAndGuestId(Long sessionId, Long guestId);
    @EntityGraph(attributePaths = {"session", "session.group", "member", "member.user", "guest", "guest.user"})
    List<GroupSessionAttendance> findAllBySessionIdOrderByIdAsc(Long sessionId);
    @EntityGraph(attributePaths = {"session", "session.group", "member", "member.user", "guest", "guest.user"})
    Optional<GroupSessionAttendance> findByIdAndSessionId(Long id, Long sessionId);
}
