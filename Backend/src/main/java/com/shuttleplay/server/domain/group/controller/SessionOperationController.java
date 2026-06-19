package com.shuttleplay.server.domain.group.controller;

import com.shuttleplay.server.domain.group.service.SessionOperationService;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/session-operations/sessions/{sessionId}")
public class SessionOperationController {
    private final SessionOperationService service;

    @GetMapping("/dashboard") public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId) { return ok(service.dashboard(userId(user), sessionId)); }
    @GetMapping("/participants") public ResponseEntity<ApiResponse<Map<String, Object>>> participants(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId) { return ok(service.participants(userId(user), sessionId)); }
    @PatchMapping("/participants/{attendanceId}/status") public ResponseEntity<ApiResponse<Map<String, Object>>> participantStatus(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @PathVariable Long attendanceId, @RequestBody Map<String, Object> body) { return ok(service.changeParticipantStatus(userId(user), sessionId, attendanceId, body)); }
    @PatchMapping("/participants/{attendanceId}/attendance") public ResponseEntity<ApiResponse<Map<String, Object>>> participantAttendance(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @PathVariable Long attendanceId, @RequestBody Map<String, Object> body) { return ok(service.changeParticipantAttendance(userId(user), sessionId, attendanceId, body)); }
    @PatchMapping("/participants/{attendanceId}/memo") public ResponseEntity<ApiResponse<Map<String, Object>>> participantMemo(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @PathVariable Long attendanceId, @RequestBody Map<String, Object> body) { return ok(service.updateParticipantMemo(userId(user), sessionId, attendanceId, body)); }
    @PatchMapping("/courts") public ResponseEntity<ApiResponse<Map<String, Object>>> courts(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @RequestBody Map<String, Object> body) { return ok(service.updateCourts(userId(user), sessionId, body)); }
    @PostMapping("/relations") public ResponseEntity<ApiResponse<Map<String, Object>>> relation(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @RequestBody Map<String, Object> body) { return ok(service.saveRelation(userId(user), sessionId, body)); }
    @DeleteMapping("/relations/{relationId}") public ResponseEntity<ApiResponse<Void>> deleteRelation(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @PathVariable Long relationId) { service.deleteRelation(userId(user), sessionId, relationId); return ResponseEntity.ok(ApiResponse.success("조합 설정을 삭제했습니다.", null)); }
    @GetMapping("/queues") public ResponseEntity<ApiResponse<Map<String, Object>>> queues(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId) { return ok(service.queues(userId(user), sessionId)); }
    @PostMapping("/matching/generate") public ResponseEntity<ApiResponse<Map<String, Object>>> generate(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @RequestBody Map<String, Object> body) { return ok(service.generate(userId(user), sessionId, body)); }
    @PostMapping("/matching/generate-plan") public ResponseEntity<ApiResponse<Map<String, Object>>> generatePlan(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @RequestBody Map<String, Object> body) { return ok(service.generatePlan(userId(user), sessionId, body)); }
    @PostMapping("/queues/assign-empty-courts") public ResponseEntity<ApiResponse<Map<String, Object>>> assignEmptyCourts(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId) { return ok(service.assignEmptyCourts(userId(user), sessionId)); }
    @PostMapping("/queues/{queueId}/call") public ResponseEntity<ApiResponse<Map<String, Object>>> call(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @PathVariable Long queueId, @RequestBody Map<String, Object> body) { return ok(service.callQueue(userId(user), sessionId, queueId, body)); }
    @PatchMapping("/queues/{queueId}") public ResponseEntity<ApiResponse<Map<String, Object>>> updateQueue(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @PathVariable Long queueId, @RequestBody Map<String, Object> body) { return ok(service.updateQueue(userId(user), sessionId, queueId, body)); }
    @PostMapping("/queues/{queueId}/cancel") public ResponseEntity<ApiResponse<Void>> cancelQueue(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @PathVariable Long queueId) { service.cancelQueue(userId(user), sessionId, queueId); return ResponseEntity.ok(ApiResponse.success("후보를 취소했습니다.", null)); }
    @PatchMapping("/queues/{queueId}/order") public ResponseEntity<ApiResponse<Map<String, Object>>> order(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @PathVariable Long queueId, @RequestBody Map<String, Object> body) { return ok(service.reorderQueue(userId(user), sessionId, queueId, body)); }
    @GetMapping("/matches") public ResponseEntity<ApiResponse<Map<String, Object>>> matches(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId) { return ok(service.current(userId(user), sessionId)); }
    @PostMapping("/queues/manual") public ResponseEntity<ApiResponse<Map<String, Object>>> manualQueue(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @RequestBody Map<String, Object> body) { return ok(service.createManualQueue(userId(user), sessionId, body)); }
    @PostMapping("/matches/{matchId}/start") public ResponseEntity<ApiResponse<Map<String, Object>>> start(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @PathVariable Long matchId) { return ok(service.startMatch(userId(user), sessionId, matchId)); }
    @PostMapping("/matches/{matchId}/result") public ResponseEntity<ApiResponse<Map<String, Object>>> result(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @PathVariable Long matchId, @RequestBody Map<String, Object> body) { return ok(service.submitOperatorResult(userId(user), sessionId, matchId, body)); }
    @PatchMapping("/matches/{matchId}/result") public ResponseEntity<ApiResponse<Map<String, Object>>> updateResult(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @PathVariable Long matchId, @RequestBody Map<String, Object> body) { return ok(service.updateResult(userId(user), sessionId, matchId, body)); }
    @PostMapping("/matches/{matchId}/cancel") public ResponseEntity<ApiResponse<Map<String, Object>>> cancelMatch(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId, @PathVariable Long matchId, @RequestBody(required = false) Map<String, Object> body) { return ok(service.cancelMatch(userId(user), sessionId, matchId, body == null ? Map.of() : body)); }
    @GetMapping("/report") public ResponseEntity<ApiResponse<Map<String, Object>>> report(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId) { return ok(service.report(userId(user), sessionId)); }
    @DeleteMapping("/matches") public ResponseEntity<ApiResponse<Map<String, Object>>> resetMatches(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId) { return ok(service.resetMatches(userId(user), sessionId)); }
    @PostMapping("/close") public ResponseEntity<ApiResponse<Map<String, Object>>> close(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId) { return ok(service.close(userId(user), sessionId)); }
    @GetMapping("/display") public ResponseEntity<ApiResponse<Map<String, Object>>> display(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long sessionId) { return ok(service.display(userId(user), sessionId)); }

    private Long userId(CustomUserDetails user) { return user == null ? null : user.getId(); }
    private ResponseEntity<ApiResponse<Map<String, Object>>> ok(Map<String, Object> data) { return ResponseEntity.ok(ApiResponse.success("Request completed.", data)); }
}
