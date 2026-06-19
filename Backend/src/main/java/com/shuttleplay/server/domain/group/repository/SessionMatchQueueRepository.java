package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.SessionMatchQueue;
import com.shuttleplay.server.domain.group.enums.SessionQueueStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionMatchQueueRepository extends JpaRepository<SessionMatchQueue, Long> {
    @EntityGraph(attributePaths = {"session", "players", "players.attendance", "players.attendance.member", "players.attendance.member.user", "players.attendance.guest"})
    List<SessionMatchQueue> findAllBySessionIdAndStatusInOrderByQueueOrderAsc(Long sessionId, Collection<SessionQueueStatus> statuses);
    @EntityGraph(attributePaths = {"session", "players", "players.attendance", "players.attendance.member", "players.attendance.member.user", "players.attendance.guest"})
    Optional<SessionMatchQueue> findByIdAndSessionId(Long id, Long sessionId);
    List<SessionMatchQueue> findAllBySessionIdOrderByQueueOrderAsc(Long sessionId);
    long countBySessionIdAndStatusIn(Long sessionId, Collection<SessionQueueStatus> statuses);
}
