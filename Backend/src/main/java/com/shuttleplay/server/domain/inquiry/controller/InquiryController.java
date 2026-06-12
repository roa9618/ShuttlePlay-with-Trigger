package com.shuttleplay.server.domain.inquiry.controller;

import com.shuttleplay.server.domain.inquiry.dto.request.CreateInquiryRequest;
import com.shuttleplay.server.domain.inquiry.dto.response.CreateInquiryResponse;
import com.shuttleplay.server.domain.inquiry.service.InquiryService;
import com.shuttleplay.server.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {
    private final InquiryService inquiryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreateInquiryResponse>> createInquiry(
            @Valid @RequestBody CreateInquiryRequest request
    ) {
        CreateInquiryResponse response = inquiryService.createInquiry(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("문의가 접수되었습니다.", response));
    }
}
