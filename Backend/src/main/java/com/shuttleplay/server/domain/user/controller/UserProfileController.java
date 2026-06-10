package com.shuttleplay.server.domain.user.controller;

import com.shuttleplay.server.domain.user.dto.request.ProfileCompletionRequest;
import com.shuttleplay.server.domain.user.dto.response.ProfileCompletionFormResponse;
import com.shuttleplay.server.domain.user.dto.response.ProfileCompletionResponse;
import com.shuttleplay.server.domain.user.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/profile-completion")
@RequiredArgsConstructor
public class UserProfileController {
    private final UserProfileService userProfileService;

    @GetMapping
    public ResponseEntity<ProfileCompletionFormResponse> getProfileCompletionForm(
            Authentication authentication
    ) {
        ProfileCompletionFormResponse response = userProfileService.getProfileCompletionForm(authentication);

        return ResponseEntity.ok(response);
    }

    @PatchMapping
    public ResponseEntity<ProfileCompletionResponse> completeProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileCompletionRequest request
    ) {
        ProfileCompletionResponse response = userProfileService.completeProfile(authentication, request);

        return ResponseEntity.ok(response);
    }
}