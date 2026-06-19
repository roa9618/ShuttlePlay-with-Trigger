package com.shuttleplay.server.domain.record.repository;

import com.shuttleplay.server.domain.record.entity.MatchRecord;
import java.util.Optional;
import java.util.List;
import java.time.LocalDateTime;
import com.shuttleplay.server.domain.record.enums.MatchOperationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface MatchRecordRepository extends JpaRepository<MatchRecord, Long> {
    @EntityGraph(attributePaths = {"players", "players.user", "players.attendance", "players.attendance.member", "players.attendance.member.user", "players.attendance.guest"})
    Optional<MatchRecord> findByIdAndSessionId(Long id, Long sessionId);
    @EntityGraph(attributePaths = {"players", "players.user", "players.attendance", "players.attendance.member", "players.attendance.member.user", "players.attendance.guest"})
    List<MatchRecord> findAllBySessionIdAndOperationStatusInAndIsDeletedFalseOrderByCourtNumberAsc(Long sessionId, List<MatchOperationStatus> statuses);
    @EntityGraph(attributePaths = {"players", "players.user", "players.attendance", "players.attendance.member", "players.attendance.member.user", "players.attendance.guest"})
    List<MatchRecord> findAllBySessionIdAndIsDeletedFalseOrderByPlayedAtAsc(Long sessionId);
    @EntityGraph(attributePaths = {"session", "players", "players.user", "players.attendance", "players.attendance.member", "players.attendance.member.user", "players.attendance.guest"})
    List<MatchRecord> findAllByOperationStatusAndIsDeletedFalseOrderByPlayedAtAsc(MatchOperationStatus status);
    boolean existsBySessionIdAndCourtNumberAndOperationStatusIn(Long sessionId, Integer courtNumber, List<MatchOperationStatus> statuses);
    boolean existsBySessionIdAndIsDeletedFalse(Long sessionId);
    @EntityGraph(attributePaths = {"players", "players.user", "players.attendance", "players.attendance.member", "players.attendance.member.user", "players.attendance.guest"})
    Optional<MatchRecord> findByMatchQueueId(Long matchQueueId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"players", "players.user", "players.attendance", "players.attendance.member", "players.attendance.member.user", "players.attendance.guest"})
    @Query("select match from MatchRecord match where match.id = :matchId and match.session.id = :sessionId")
    Optional<MatchRecord> findLockedByIdAndSessionId(@Param("matchId") Long matchId, @Param("sessionId") Long sessionId);
    @EntityGraph(attributePaths = {"session", "session.group", "matchQueue", "players", "players.user", "players.attendance", "players.attendance.member", "players.attendance.member.user", "players.attendance.guest"})
    List<MatchRecord> findAllByOperationStatusAndCalledAtBeforeAndIsDeletedFalse(MatchOperationStatus status, LocalDateTime calledAt);
}
