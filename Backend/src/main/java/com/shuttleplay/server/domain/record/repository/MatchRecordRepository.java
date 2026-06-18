package com.shuttleplay.server.domain.record.repository;

import com.shuttleplay.server.domain.record.entity.MatchRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRecordRepository extends JpaRepository<MatchRecord, Long> {
}
