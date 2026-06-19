package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupSessionAttendance;
import com.shuttleplay.server.domain.group.enums.GroupSessionStatus;
import com.shuttleplay.server.domain.group.enums.SessionAttendanceStatus;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GroupSessionAttendanceRepository extends JpaRepository<GroupSessionAttendance, Long> {
    Optional<GroupSessionAttendance> findBySessionIdAndMemberId(Long sessionId, Long memberId);
    Optional<GroupSessionAttendance> findBySessionIdAndGuestId(Long sessionId, Long guestId);
    @EntityGraph(attributePaths = {"session", "session.group", "member", "member.user", "guest", "guest.user"})
    List<GroupSessionAttendance> findAllBySessionIdOrderByIdAsc(Long sessionId);
    @EntityGraph(attributePaths = {"session", "session.group", "member", "member.user", "guest", "guest.user"})
    Optional<GroupSessionAttendance> findByIdAndSessionId(Long id, Long sessionId);

    @EntityGraph(attributePaths = {"session", "session.group", "member", "member.user", "guest", "guest.user"})
    @Query("""
            select entry
            from GroupSessionAttendance entry
            where (
                    entry.member.user.id = :userId
                    or entry.guest.user.id = :userId
                  )
              and entry.status in :statuses
              and entry.session.startsAt >= :from
              and entry.session.startsAt < :to
              and entry.isDeleted = false
              and entry.session.isDeleted = false
            order by entry.session.startsAt asc
            """)
    List<GroupSessionAttendance> findUserRecordAttendances(
            @Param("userId") Long userId,
            @Param("from") java.time.LocalDateTime from,
            @Param("to") java.time.LocalDateTime to,
            @Param("statuses") List<SessionAttendanceStatus> statuses
    );

    @Query("""
            select entry.session.group.id as groupId, max(entry.session.startsAt) as lastParticipationAt
            from GroupSessionAttendance entry
            where entry.member.user.id = :userId
              and entry.session.group.id in :groupIds
              and entry.status in :statuses
              and entry.session.status = :sessionStatus
              and entry.isDeleted = false
              and entry.session.isDeleted = false
            group by entry.session.group.id
            """)
    List<GroupLastParticipation> findLastParticipationsByUserAndGroups(
            @Param("userId") Long userId,
            @Param("groupIds") List<Long> groupIds,
            @Param("statuses") List<SessionAttendanceStatus> statuses,
            @Param("sessionStatus") GroupSessionStatus sessionStatus
    );
}
