package com.shuttleplay.server.domain.user.controller;

import com.shuttleplay.server.domain.user.dto.response.CurrentUserResponse;
import com.shuttleplay.server.domain.user.service.UserService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        CurrentUserResponse response = userService.getCurrentUser(userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("현재 로그인 사용자 정보를 조회했습니다.", response));
    }
}