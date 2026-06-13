package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupSessionVote;
import com.shuttleplay.server.domain.group.enums.SessionVoteStatus;
import com.shuttleplay.server.domain.group.enums.GroupSessionStatus;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupSessionVoteRepository extends JpaRepository<GroupSessionVote, Long> {
    Optional<GroupSessionVote> findBySessionIdAndMemberId(Long sessionId, Long memberId);
    List<GroupSessionVote> findAllBySessionIdAndStatus(Long sessionId, SessionVoteStatus status);
    long countBySessionIdAndStatus(Long sessionId, SessionVoteStatus status);
    long countByMemberIdAndStatusAndSession_Status(Long memberId, SessionVoteStatus status, GroupSessionStatus sessionStatus);
    long countByMemberIdAndStatusAndSession_StartsAtBetweenAndSession_StatusNot(
            Long memberId,
            SessionVoteStatus status,
            LocalDateTime from,
            LocalDateTime to,
            GroupSessionStatus excludedStatus
    );
    long countByMemberIdAndStatusAndSession_StartsAtBetweenAndSession_Status(
            Long memberId,
            SessionVoteStatus status,
            LocalDateTime from,
            LocalDateTime to,
            GroupSessionStatus sessionStatus
    );
}
