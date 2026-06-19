package com.shuttleplay.server.domain.record.repository;

import com.shuttleplay.server.domain.record.entity.MmrHistory;
import com.shuttleplay.server.domain.record.enums.MmrType;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MmrHistoryRepository extends JpaRepository<MmrHistory, Long> {
    List<MmrHistory> findAllByUserIdAndMmrTypeAndChangedAtBetweenAndIsDeletedFalseOrderByChangedAtAsc(
            Long userId, MmrType mmrType, LocalDateTime from, LocalDateTime to);
    List<MmrHistory> findAllByMatch_Session_Id(Long sessionId);
}
