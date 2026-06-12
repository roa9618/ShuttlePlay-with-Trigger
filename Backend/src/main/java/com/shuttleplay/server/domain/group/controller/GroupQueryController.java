package com.shuttleplay.server.domain.group.controller;

import com.shuttleplay.server.domain.group.dto.response.GroupActivitySummaryResponse;
import com.shuttleplay.server.domain.group.dto.response.GroupListResponse;
import com.shuttleplay.server.domain.group.dto.response.GroupOverviewResponse;
import com.shuttleplay.server.domain.group.enums.GroupMemberRole;
import com.shuttleplay.server.domain.group.service.GroupQueryService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupQueryController {
    private final GroupQueryService groupQueryService;

    @GetMapping("/me/overview")
    public ResponseEntity<ApiResponse<GroupOverviewResponse>> getOverview(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        GroupOverviewResponse response = groupQueryService.getOverview(userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("내 모임 요약을 조회했습니다.", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<GroupListResponse>> getMyGroups(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) GroupMemberRole role,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "5") @Min(1) @Max(100) int size
    ) {
        GroupListResponse response = groupQueryService.getMyGroups(
                userDetails.getId(),
                keyword,
                role,
                page,
                size
        );

        return ResponseEntity.ok(ApiResponse.success("내 모임 목록을 조회했습니다.", response));
    }

    @GetMapping("/{groupId}/activity-summary")
    public ResponseEntity<ApiResponse<GroupActivitySummaryResponse>> getActivitySummary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long groupId
    ) {
        GroupActivitySummaryResponse response = groupQueryService.getActivitySummary(
                userDetails.getId(),
                groupId
        );

        return ResponseEntity.ok(ApiResponse.success("모임 활동 분석을 조회했습니다.", response));
    }
}
