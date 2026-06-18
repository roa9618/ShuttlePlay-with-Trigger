package com.shuttleplay.server.domain.notice.repository;

import com.shuttleplay.server.domain.notice.entity.Notice;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    @EntityGraph(attributePaths = "author")
    Page<Notice> findAllByIsDeletedFalseAndTitleContainingIgnoreCase(String keyword, Pageable pageable);

    @EntityGraph(attributePaths = "author")
    Optional<Notice> findByIdAndIsDeletedFalse(Long id);
}
