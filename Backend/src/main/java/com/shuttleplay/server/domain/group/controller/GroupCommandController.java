package com.shuttleplay.server.domain.group.controller;

import com.shuttleplay.server.domain.group.dto.request.CreateGroupRequest;
import com.shuttleplay.server.domain.group.dto.response.CreateGroupResponse;
import com.shuttleplay.server.domain.group.service.GroupCommandService;
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

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupCommandController {
    private final GroupCommandService groupCommandService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreateGroupResponse>> createGroup(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateGroupRequest request
    ) {
        CreateGroupResponse response = groupCommandService.createGroup(userDetails.getId(), request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("모임을 생성했습니다.", response));
    }
}
