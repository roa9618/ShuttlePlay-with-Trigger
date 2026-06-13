package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupSession;
import com.shuttleplay.server.domain.group.enums.GroupSessionStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupSessionRepository extends JpaRepository<GroupSession, Long> {
    @EntityGraph(attributePaths = {"group"})
    List<GroupSession> findAllByGroupIdInAndStartsAtBetweenAndStatusNot(
            Collection<Long> groupIds,
            LocalDateTime startsAtFrom,
            LocalDateTime startsAtTo,
            GroupSessionStatus excludedStatus
    );

    List<GroupSession> findAllByGroupIdAndStartsAtBetweenAndStatusNotAndIsDeletedFalse(
            Long groupId,
            LocalDateTime startsAtFrom,
            LocalDateTime startsAtTo,
            GroupSessionStatus excludedStatus
    );

    @EntityGraph(attributePaths = {"group"})
    Optional<GroupSession> findByIdAndGroupIdAndIsDeletedFalse(Long id, Long groupId);

    List<GroupSession> findAllByGroupIdAndStartsAtBetweenAndIsDeletedFalse(Long groupId, LocalDateTime from, LocalDateTime to);

    List<GroupSession> findAllByGroupIdAndStartsAtBetweenAndStatusAndIsDeletedFalse(
            Long groupId, LocalDateTime from, LocalDateTime to, GroupSessionStatus status);

    List<GroupSession> findAllByGroupIdAndStartsAtBetweenAndStatusInAndIsDeletedFalse(
            Long groupId, LocalDateTime from, LocalDateTime to, Collection<GroupSessionStatus> statuses);

    List<GroupSession> findTop3ByGroupIdAndStatusAndIsDeletedFalseOrderByStartsAtDesc(Long groupId, GroupSessionStatus status);

    long countByGroupIdAndStartsAtAfterAndStatusInAndIsDeletedFalse(Long groupId, LocalDateTime startsAt, Collection<GroupSessionStatus> statuses);

    long countByGroupIdAndStatusAndIsDeletedFalse(Long groupId, GroupSessionStatus status);

    @EntityGraph(attributePaths = {"group"})
    List<GroupSession> findAllByVoteDeadlineBetweenAndIsDeletedFalse(LocalDateTime from, LocalDateTime to);

    @EntityGraph(attributePaths = {"group"})
    List<GroupSession> findAllByStartsAtBetweenAndIsDeletedFalse(LocalDateTime from, LocalDateTime to);
}
