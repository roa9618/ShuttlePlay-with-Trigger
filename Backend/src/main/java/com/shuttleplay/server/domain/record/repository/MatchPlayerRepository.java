package com.shuttleplay.server.domain.record.repository;

import com.shuttleplay.server.domain.record.entity.MatchPlayer;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatchPlayerRepository extends JpaRepository<MatchPlayer, Long>, JpaSpecificationExecutor<MatchPlayer> {
    @EntityGraph(attributePaths = {"match", "match.session", "match.session.group", "match.players", "match.players.user", "user"})
    @Query("""
            select distinct player
            from MatchPlayer player
            where player.user.id = :userId
              and player.match.isDeleted = false
              and player.match.operationStatus = com.shuttleplay.server.domain.record.enums.MatchOperationStatus.RESULT_ENTERED
            order by player.match.playedAt desc
            """)
    List<MatchPlayer> findUserMatchRecords(@Param("userId") Long userId);

    @EntityGraph(attributePaths = {"match", "match.session", "match.session.group", "match.players", "match.players.user", "user"})
    @Query("""
            select distinct player
            from MatchPlayer player
            where player.user.id = :userId
              and player.match.session.id = :sessionId
              and player.match.isDeleted = false
              and player.match.operationStatus = com.shuttleplay.server.domain.record.enums.MatchOperationStatus.RESULT_ENTERED
            order by player.match.playedAt asc
            """)
    List<MatchPlayer> findUserSessionMatchRecords(@Param("userId") Long userId, @Param("sessionId") Long sessionId);

    @EntityGraph(attributePaths = {"match", "user", "attendance", "attendance.member", "attendance.member.user", "attendance.guest"})
    List<MatchPlayer> findAllByMatch_Session_Id(Long sessionId);

    long countByAttendanceIdAndMatchOperationStatusAndMatchIsDeletedFalse(Long attendanceId, com.shuttleplay.server.domain.record.enums.MatchOperationStatus status);
    List<MatchPlayer> findAllByMatch_Session_IdAndMatch_IsDeletedFalse(Long sessionId);
}
