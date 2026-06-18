package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupSessionAttendance;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupSessionAttendanceRepository extends JpaRepository<GroupSessionAttendance, Long> {
    Optional<GroupSessionAttendance> findBySessionIdAndMemberId(Long sessionId, Long memberId);
    Optional<GroupSessionAttendance> findBySessionIdAndGuestId(Long sessionId, Long guestId);
}
