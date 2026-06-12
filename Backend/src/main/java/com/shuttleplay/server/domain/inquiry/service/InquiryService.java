package com.shuttleplay.server.domain.inquiry.service;

import com.shuttleplay.server.domain.inquiry.dto.request.CreateInquiryRequest;
import com.shuttleplay.server.domain.inquiry.dto.response.CreateInquiryResponse;
import com.shuttleplay.server.domain.inquiry.entity.Inquiry;
import com.shuttleplay.server.domain.inquiry.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InquiryService {
    private final InquiryRepository inquiryRepository;

    public CreateInquiryResponse createInquiry(CreateInquiryRequest request) {
        Inquiry inquiry = inquiryRepository.save(Inquiry.create(
                request.getCategory(),
                request.getName().trim(),
                request.getEmail().trim(),
                request.getSubject().trim(),
                request.getMessage().trim()
        ));

        return CreateInquiryResponse.from(inquiry);
    }
}
