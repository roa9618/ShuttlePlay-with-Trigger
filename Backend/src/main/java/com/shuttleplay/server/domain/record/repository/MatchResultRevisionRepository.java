package com.shuttleplay.server.domain.record.repository;

import com.shuttleplay.server.domain.record.entity.MatchResultRevision;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchResultRevisionRepository extends JpaRepository<MatchResultRevision, Long> {
    @EntityGraph(attributePaths = {"modifiedBy"})
    List<MatchResultRevision> findAllByMatchIdOrderByCreatedAtDesc(Long matchId);
    List<MatchResultRevision> findAllByMatch_Session_Id(Long sessionId);
}
