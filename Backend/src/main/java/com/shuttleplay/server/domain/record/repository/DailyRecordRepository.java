package com.shuttleplay.server.domain.record.repository;

import com.shuttleplay.server.domain.record.entity.DailyRecord;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyRecordRepository extends JpaRepository<DailyRecord, Long> {
    Optional<DailyRecord> findByUserIdAndRecordDate(Long userId, LocalDate recordDate);
}
