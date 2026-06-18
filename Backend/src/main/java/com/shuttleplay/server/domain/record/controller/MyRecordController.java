package com.shuttleplay.server.domain.record.controller;

import com.shuttleplay.server.domain.record.dto.MatchRecordPageResponse;
import com.shuttleplay.server.domain.record.dto.MmrHistoryResponse;
import com.shuttleplay.server.domain.record.dto.MyRecordSummaryResponse;
import com.shuttleplay.server.domain.record.enums.MatchType;
import com.shuttleplay.server.domain.record.enums.MmrType;
import com.shuttleplay.server.domain.record.service.MyRecordService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import java.time.LocalDate;
import java.time.YearMonth;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/records/me")
@RequiredArgsConstructor
public class MyRecordController {
    private final MyRecordService service;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<MyRecordSummaryResponse>> summary(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        YearMonth selected = month == null ? YearMonth.now() : month;
        return ResponseEntity.ok(ApiResponse.success("내 기록을 조회했습니다.", service.summary(user.getId(), selected)));
    }

    @GetMapping("/mmr")
    public ResponseEntity<ApiResponse<MmrHistoryResponse>> mmr(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam MmrType type,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success("MMR 이력을 조회했습니다.", service.mmrHistory(user.getId(), type, from, to)));
    }

    @GetMapping("/matches")
    public ResponseEntity<ApiResponse<MatchRecordPageResponse>> matches(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) MatchType type,
            @RequestParam(required = false) String result) {
        return ResponseEntity.ok(ApiResponse.success("전체 경기 기록을 조회했습니다.",
                service.matches(user.getId(), page, size, from, to, groupId, type, result)));
    }
}
