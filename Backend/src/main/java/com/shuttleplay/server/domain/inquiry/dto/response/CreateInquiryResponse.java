package com.shuttleplay.server.domain.inquiry.dto.response;

import com.shuttleplay.server.domain.inquiry.entity.Inquiry;
import com.shuttleplay.server.domain.inquiry.enums.InquiryStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
public class CreateInquiryResponse {
    private final Long id;
    private final InquiryStatus status;
    private final LocalDateTime createdAt;

    @Builder
    private CreateInquiryResponse(Long id, InquiryStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static CreateInquiryResponse from(Inquiry inquiry) {
        return CreateInquiryResponse.builder()
                .id(inquiry.getId())
                .status(inquiry.getStatus())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}
