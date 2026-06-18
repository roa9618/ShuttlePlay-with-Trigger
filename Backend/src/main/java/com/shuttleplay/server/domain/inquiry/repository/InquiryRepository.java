package com.shuttleplay.server.domain.inquiry.repository;

import com.shuttleplay.server.domain.inquiry.entity.Inquiry;
import com.shuttleplay.server.domain.inquiry.enums.InquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    long countByStatusNot(InquiryStatus status);
}
