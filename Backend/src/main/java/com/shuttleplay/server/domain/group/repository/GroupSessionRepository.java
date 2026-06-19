package com.shuttleplay.server.domain.group.repository;

import com.shuttleplay.server.domain.group.entity.GroupSession;
import com.shuttleplay.server.domain.group.enums.GroupSessionStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface GroupSessionRepository extends JpaRepository<GroupSession, Long> {
    boolean existsByEntryCode(String entryCode);
    List<GroupSession> findAllByEntryCodeIsNullAndIsDeletedFalse();

    @EntityGraph(attributePaths = {"group"})
    Optional<GroupSession> findByEntryCodeAndIsDeletedFalse(String entryCode);
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

    @EntityGraph(attributePaths = {"group"})
    Optional<GroupSession> findByIdAndIsDeletedFalse(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"group"})
    @Query("select session from GroupSession session where session.id = :sessionId and session.isDeleted = false")
    Optional<GroupSession> findLockedByIdAndIsDeletedFalse(@Param("sessionId") Long sessionId);

    List<GroupSession> findAllByGroupIdAndStartsAtBetweenAndIsDeletedFalse(Long groupId, LocalDateTime from, LocalDateTime to);

    List<GroupSession> findAllByGroupIdAndStartsAtBetweenAndStatusAndIsDeletedFalse(
            Long groupId, LocalDateTime from, LocalDateTime to, GroupSessionStatus status);

    List<GroupSession> findAllByGroupIdAndStartsAtBetweenAndStatusInAndIsDeletedFalse(
            Long groupId, LocalDateTime from, LocalDateTime to, Collection<GroupSessionStatus> statuses);

    @Query("""
            select session from GroupSession session
            where session.group.id = :groupId
              and session.startsAt <= :now
              and (session.endsAt is null or session.endsAt >= :now)
              and session.status in :statuses
              and session.isDeleted = false
            """)
    List<GroupSession> findCurrentSessions(@Param("groupId") Long groupId, @Param("now") LocalDateTime now,
                                           @Param("statuses") Collection<GroupSessionStatus> statuses);

    List<GroupSession> findTop3ByGroupIdAndStatusAndIsDeletedFalseOrderByStartsAtDesc(Long groupId, GroupSessionStatus status);

    long countByGroupIdAndStartsAtAfterAndStatusInAndIsDeletedFalse(Long groupId, LocalDateTime startsAt, Collection<GroupSessionStatus> statuses);

    long countByGroupIdAndStatusAndIsDeletedFalse(Long groupId, GroupSessionStatus status);

    @EntityGraph(attributePaths = {"group"})
    List<GroupSession> findAllByVoteDeadlineBetweenAndIsDeletedFalse(LocalDateTime from, LocalDateTime to);

    @EntityGraph(attributePaths = {"group"})
    List<GroupSession> findAllByStartsAtBetweenAndIsDeletedFalse(LocalDateTime from, LocalDateTime to);

    @EntityGraph(attributePaths = {"group"})
    List<GroupSession> findAllByStartsAtBetweenAndStatusInAndIsDeletedFalse(
            LocalDateTime from, LocalDateTime to, Collection<GroupSessionStatus> statuses);
}
