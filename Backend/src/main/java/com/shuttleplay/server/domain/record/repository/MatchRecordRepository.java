package com.shuttleplay.server.domain.record.repository;

import com.shuttleplay.server.domain.record.entity.MatchRecord;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRecordRepository extends JpaRepository<MatchRecord, Long> {
    @EntityGraph(attributePaths = {"players", "players.user"})
    Optional<MatchRecord> findByIdAndSessionId(Long id, Long sessionId);
}
