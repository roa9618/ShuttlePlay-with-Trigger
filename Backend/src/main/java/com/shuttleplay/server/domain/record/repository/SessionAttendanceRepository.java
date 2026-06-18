package com.shuttleplay.server.domain.record.repository;

import com.shuttleplay.server.domain.record.entity.SessionAttendance;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionAttendanceRepository extends JpaRepository<SessionAttendance, Long> {
    @EntityGraph(attributePaths = {"session", "session.group"})
    List<SessionAttendance> findAllByUserIdAndAttendedAtBetweenAndIsDeletedFalseOrderByAttendedAtAsc(
            Long userId, LocalDateTime from, LocalDateTime to);
}
