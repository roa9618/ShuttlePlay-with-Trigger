package com.shuttleplay.server.domain.group.controller;

import com.shuttleplay.server.domain.group.dto.request.CreateGroupRequest;
import com.shuttleplay.server.domain.group.dto.response.CreateGroupResponse;
import com.shuttleplay.server.domain.group.dto.response.GroupImageUploadResponse;
import com.shuttleplay.server.domain.group.service.GroupCommandService;
import com.shuttleplay.server.domain.group.service.GroupImageService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupCommandController {
    private final GroupCommandService groupCommandService;
    private final GroupImageService groupImageService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreateGroupResponse>> createGroup(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateGroupRequest request
    ) {
        CreateGroupResponse response = groupCommandService.createGroup(userDetails.getId(), request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("모임을 생성했습니다.", response));
    }

    @PostMapping("/images")
    public ResponseEntity<ApiResponse<GroupImageUploadResponse>> uploadImage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("image") MultipartFile image
    ) {
        String imageUrl = groupImageService.upload(image);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "모임 대표 이미지를 업로드했습니다.",
                        GroupImageUploadResponse.of(imageUrl)
                ));
    }
}
