package com.shuttleplay.server.domain.user.controller;

import com.shuttleplay.server.domain.user.dto.request.UpdateNotificationSettingsRequest;
import com.shuttleplay.server.domain.user.dto.request.UpdatePasswordRequest;
import com.shuttleplay.server.domain.user.dto.request.UpdateUserProfileRequest;
import com.shuttleplay.server.domain.user.dto.response.CurrentUserResponse;
import com.shuttleplay.server.domain.user.dto.response.UserImageUploadResponse;
import com.shuttleplay.server.domain.user.dto.response.UserNotificationSettingsResponse;
import com.shuttleplay.server.domain.user.service.UserImageService;
import com.shuttleplay.server.domain.user.service.UserService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserImageService userImageService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        CurrentUserResponse response = userService.getCurrentUser(userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("현재 로그인 사용자 정보를 조회했습니다.", response));
    }

    @PatchMapping("/me/profile")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateUserProfileRequest request
    ) {
        CurrentUserResponse response = userService.updateProfile(userDetails.getId(), request);

        return ResponseEntity.ok(ApiResponse.success("프로필을 수정했습니다.", response));
    }

    @PostMapping("/me/profile-image")
    public ResponseEntity<ApiResponse<UserImageUploadResponse>> uploadProfileImage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("image") MultipartFile image
    ) {
        String imageUrl = userImageService.upload(image);
        userService.updateProfileImage(userDetails.getId(), imageUrl);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("프로필 이미지를 변경했습니다.", UserImageUploadResponse.of(imageUrl)));
    }

    @DeleteMapping("/me/profile-image")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> deleteProfileImage(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        CurrentUserResponse response = userService.deleteProfileImage(userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("프로필 이미지를 삭제했습니다.", response));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdatePasswordRequest request
    ) {
        userService.updatePassword(userDetails.getId(), request);

        return ResponseEntity.ok(ApiResponse.success("비밀번호를 변경했습니다."));
    }

    @GetMapping("/me/notification-settings")
    public ResponseEntity<ApiResponse<UserNotificationSettingsResponse>> getNotificationSettings(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        UserNotificationSettingsResponse response = userService.getNotificationSettings(userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("알림 설정을 조회했습니다.", response));
    }

    @PatchMapping("/me/notification-settings")
    public ResponseEntity<ApiResponse<UserNotificationSettingsResponse>> updateNotificationSettings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateNotificationSettingsRequest request
    ) {
        UserNotificationSettingsResponse response = userService.updateNotificationSettings(
                userDetails.getId(),
                request
        );

        return ResponseEntity.ok(ApiResponse.success("알림 설정을 저장했습니다.", response));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        userService.deleteAccount(userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("계정을 탈퇴했습니다."));
    }
}
