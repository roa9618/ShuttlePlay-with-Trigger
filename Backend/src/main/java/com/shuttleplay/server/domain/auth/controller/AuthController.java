package com.shuttleplay.server.domain.auth.controller;

import com.shuttleplay.server.domain.auth.dto.request.CheckEmailRequest;
import com.shuttleplay.server.domain.auth.dto.request.EmailVerificationConfirmRequest;
import com.shuttleplay.server.domain.auth.dto.request.EmailVerificationSendRequest;
import com.shuttleplay.server.domain.auth.dto.request.LoginRequest;
import com.shuttleplay.server.domain.auth.dto.request.RegisterRequest;
import com.shuttleplay.server.domain.auth.dto.response.CheckEmailResponse;
import com.shuttleplay.server.domain.auth.dto.response.EmailVerificationConfirmResponse;
import com.shuttleplay.server.domain.auth.dto.response.EmailVerificationSendResponse;
import com.shuttleplay.server.domain.auth.dto.response.LoginResponse;
import com.shuttleplay.server.domain.auth.dto.response.RegisterResponse;
import com.shuttleplay.server.domain.auth.service.AuthService;
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
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/check-email")
    public ResponseEntity<ApiResponse<CheckEmailResponse>> checkEmail(
            @Valid @RequestBody CheckEmailRequest request
    ) {
        CheckEmailResponse response = authService.checkEmail(request);
        String message = response.isAvailable()
                ? "사용 가능한 이메일입니다."
                : "이미 사용 중인 이메일입니다.";

        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @PostMapping("/email-verification/send")
    public ResponseEntity<ApiResponse<EmailVerificationSendResponse>> sendEmailVerification(
            @Valid @RequestBody EmailVerificationSendRequest request
    ) {
        EmailVerificationSendResponse response = authService.sendEmailVerification(request);

        return ResponseEntity.ok(ApiResponse.success("이메일 인증 코드가 발송되었습니다.", response));
    }

    @PostMapping("/email-verification/confirm")
    public ResponseEntity<ApiResponse<EmailVerificationConfirmResponse>> confirmEmailVerification(
            @Valid @RequestBody EmailVerificationConfirmRequest request
    ) {
        EmailVerificationConfirmResponse response = authService.confirmEmailVerification(request);

        return ResponseEntity.ok(ApiResponse.success("이메일 인증이 완료되었습니다.", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        RegisterResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("회원가입이 완료되었습니다.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(ApiResponse.success("로그인되었습니다.", response));
    }
}