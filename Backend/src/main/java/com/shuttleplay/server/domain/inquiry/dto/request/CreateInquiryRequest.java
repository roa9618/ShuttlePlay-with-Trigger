package com.shuttleplay.server.domain.inquiry.dto.request;

import com.shuttleplay.server.domain.inquiry.enums.InquiryCategory;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CreateInquiryRequest {
    @NotNull
    private InquiryCategory category;

    @NotBlank
    @Size(max = 50)
    private String name;

    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @NotBlank
    @Size(max = 100)
    private String subject;

    @NotBlank
    @Size(min = 10, max = 2000)
    private String message;

    @AssertTrue
    private boolean privacyAgreed;
}
