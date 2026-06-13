package com.shuttleplay.server.domain.group.controller;

import com.shuttleplay.server.domain.group.enums.*;
import com.shuttleplay.server.domain.group.service.*;
import com.shuttleplay.server.domain.user.enums.Grade;
import com.shuttleplay.server.global.common.ApiResponse;
import com.shuttleplay.server.global.security.CustomUserDetails;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/groups/{groupId}")
@RequiredArgsConstructor
public class GroupDetailController {
    private final GroupDetailService service;
    private final GroupImageService imageService;
    private final GroupPostAttachmentService attachmentService;

    @GetMapping public ResponseEntity<ApiResponse<Map<String, Object>>> group(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId) { return ok(service.group(u.getId(), groupId)); }
    @GetMapping("/dashboard") public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId) { return ok(service.dashboard(u.getId(), groupId)); }
    @GetMapping("/operation-guide") public ResponseEntity<ApiResponse<Map<String, Object>>> guide(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId) { return ok(service.operationGuide(u.getId(), groupId)); }
    @PutMapping("/operation-guide") public ResponseEntity<ApiResponse<Void>> saveGuide(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestBody Map<String, Object> b) { service.saveOperationGuide(u.getId(), groupId, String.valueOf(b.get("content"))); return done(); }
    @DeleteMapping("/operation-guide") public ResponseEntity<ApiResponse<Void>> deleteGuide(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId) { service.deleteOperationGuide(u.getId(), groupId); return done(); }
    @PostMapping("/leave") public ResponseEntity<ApiResponse<Void>> leave(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId) { service.leave(u.getId(), groupId); return done(); }

    @GetMapping("/sessions") public ResponseEntity<ApiResponse<List<Map<String, Object>>>> sessions(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestParam int year, @RequestParam int month, @RequestParam(required = false) Integer day) { return ok(service.sessionList(u.getId(), groupId, year, month, day)); }
    @GetMapping("/sessions/monthly-summary") public ResponseEntity<ApiResponse<Map<String, Object>>> monthly(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestParam int year, @RequestParam int month) { return ok(service.monthlySummary(u.getId(), groupId, year, month)); }
    @GetMapping("/sessions/{sessionId}") public ResponseEntity<ApiResponse<Map<String, Object>>> session(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long sessionId) { return ok(service.session(u.getId(), groupId, sessionId)); }
    @PutMapping("/sessions/{sessionId}") public ResponseEntity<ApiResponse<Void>> updateSession(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long sessionId, @RequestBody Map<String, Object> b) { service.updateSession(u.getId(), groupId, sessionId, b); return done(); }
    @PostMapping("/sessions/{sessionId}/cancel") public ResponseEntity<ApiResponse<Void>> cancelSession(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long sessionId) { service.cancelSession(u.getId(), groupId, sessionId); return done(); }
    @DeleteMapping("/sessions/{sessionId}") public ResponseEntity<ApiResponse<Void>> deleteSession(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long sessionId) { service.deleteSession(u.getId(), groupId, sessionId); return done(); }
    @PutMapping("/sessions/{sessionId}/vote") public ResponseEntity<ApiResponse<Void>> vote(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long sessionId, @RequestBody Map<String, Object> b) { service.vote(u.getId(), groupId, sessionId, SessionVoteStatus.valueOf(String.valueOf(b.get("status")))); return done(); }
    @GetMapping("/sessions/{sessionId}/participants") public ResponseEntity<ApiResponse<List<Map<String, Object>>>> participants(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long sessionId, @RequestParam SessionVoteStatus status) { return ok(service.participants(u.getId(), groupId, sessionId, status)); }
    @PostMapping("/sessions/{sessionId}/guests") public ResponseEntity<ApiResponse<Map<String, Object>>> addGuest(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long sessionId, @RequestBody Map<String, Object> b) { return ok(service.addGuest(u.getId(), groupId, sessionId, b)); }
    @PutMapping("/sessions/{sessionId}/guests/{guestId}") public ResponseEntity<ApiResponse<Void>> updateGuest(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long sessionId, @PathVariable Long guestId, @RequestBody Map<String, Object> b) { service.updateGuest(u.getId(), groupId, sessionId, guestId, b); return done(); }
    @DeleteMapping("/sessions/{sessionId}/guests/{guestId}") public ResponseEntity<ApiResponse<Void>> deleteGuest(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long sessionId, @PathVariable Long guestId) { service.deleteGuest(u.getId(), groupId, sessionId, guestId); return done(); }

    @GetMapping("/posts") public ResponseEntity<ApiResponse<Map<String, Object>>> posts(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestParam(defaultValue = "") String keyword, @RequestParam(required = false) GroupPostType type, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) { return ok(service.postList(u.getId(), groupId, keyword, type, page, size)); }
    @GetMapping("/posts/{postId}") public ResponseEntity<ApiResponse<Map<String, Object>>> post(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long postId) { return ok(service.post(u.getId(), groupId, postId)); }
    @PostMapping("/posts") public ResponseEntity<ApiResponse<Map<String, Object>>> createPost(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestBody Map<String, Object> b) { return ok(service.createPost(u.getId(), groupId, b)); }
    @PostMapping("/posts/attachments") public ResponseEntity<ApiResponse<List<Map<String, String>>>> attachments(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestParam("files") List<MultipartFile> files) { service.assertPostAttachmentAllowed(u.getId(), groupId); return ok(attachmentService.upload(files)); }
    @PutMapping("/posts/{postId}") public ResponseEntity<ApiResponse<Void>> updatePost(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long postId, @RequestBody Map<String, Object> b) { service.updatePost(u.getId(), groupId, postId, b); return done(); }
    @DeleteMapping("/posts/{postId}") public ResponseEntity<ApiResponse<Void>> deletePost(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long postId) { service.deletePost(u.getId(), groupId, postId); return done(); }
    @PutMapping("/posts/{postId}/pin") public ResponseEntity<ApiResponse<Void>> pin(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long postId) { service.pinPost(u.getId(), groupId, postId); return done(); }
    @GetMapping("/posts/{postId}/comments") public ResponseEntity<ApiResponse<List<Map<String, Object>>>> comments(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long postId) { return ok(service.commentList(u.getId(), groupId, postId)); }
    @PostMapping("/posts/{postId}/comments") public ResponseEntity<ApiResponse<Map<String, Object>>> comment(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long postId, @RequestBody Map<String, Object> b) { return ok(service.createComment(u.getId(), groupId, postId, null, String.valueOf(b.get("content")))); }
    @PostMapping("/posts/{postId}/comments/{commentId}/replies") public ResponseEntity<ApiResponse<Map<String, Object>>> reply(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long postId, @PathVariable Long commentId, @RequestBody Map<String, Object> b) { return ok(service.createComment(u.getId(), groupId, postId, commentId, String.valueOf(b.get("content")))); }
    @PutMapping("/posts/{postId}/comments/{commentId}") public ResponseEntity<ApiResponse<Void>> updateComment(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long postId, @PathVariable Long commentId, @RequestBody Map<String, Object> b) { service.updateComment(u.getId(), groupId, postId, commentId, String.valueOf(b.get("content"))); return done(); }
    @DeleteMapping("/posts/{postId}/comments/{commentId}") public ResponseEntity<ApiResponse<Void>> deleteComment(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long postId, @PathVariable Long commentId) { service.deleteComment(u.getId(), groupId, postId, commentId); return done(); }

    @GetMapping("/members") public ResponseEntity<ApiResponse<Map<String, Object>>> members(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestParam(defaultValue = "") String keyword, @RequestParam(required = false) GroupMemberRole role, @RequestParam(required = false) Grade grade, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "12") int size) { return ok(service.memberList(u.getId(), groupId, keyword, role, grade, page, size)); }
    @GetMapping("/members/{memberId}") public ResponseEntity<ApiResponse<Map<String, Object>>> member(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long memberId) { return ok(service.member(u.getId(), groupId, memberId)); }
    @PutMapping("/members/{memberId}/memo") public ResponseEntity<ApiResponse<Void>> memo(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long memberId, @RequestBody Map<String, Object> b) { service.memo(u.getId(), groupId, memberId, String.valueOf(b.get("memo"))); return done(); }
    @PutMapping("/members/{memberId}/role") public ResponseEntity<ApiResponse<Void>> role(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long memberId, @RequestBody Map<String, Object> b) { service.role(u.getId(), groupId, memberId, GroupMemberRole.valueOf(String.valueOf(b.get("role")))); return done(); }
    @GetMapping("/members/{memberId}/permissions") public ResponseEntity<ApiResponse<Map<String, Object>>> permissions(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long memberId) { return ok(service.permissions(u.getId(), groupId, memberId)); }
    @PutMapping("/members/{memberId}/permissions") public ResponseEntity<ApiResponse<Void>> permissions(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long memberId, @RequestBody Map<String, Object> b) { service.permissions(u.getId(), groupId, memberId, b); return done(); }
    @PutMapping("/owner") public ResponseEntity<ApiResponse<Void>> owner(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestBody Map<String, Object> b) { service.transferOwner(u.getId(), groupId, Long.valueOf(String.valueOf(b.get("memberId")))); return done(); }
    @DeleteMapping("/members/{memberId}") public ResponseEntity<ApiResponse<Void>> remove(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long memberId) { service.removeMember(u.getId(), groupId, memberId); return done(); }

    @GetMapping("/join-requests") public ResponseEntity<ApiResponse<Map<String, Object>>> requests(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "6") int size) { return ok(service.requestList(u.getId(), groupId, page, size)); }
    @PostMapping("/join-requests/{id}/approve") public ResponseEntity<ApiResponse<Void>> approve(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long id) { service.processRequest(u.getId(), groupId, id, true); return done(); }
    @PostMapping("/join-requests/{id}/reject") public ResponseEntity<ApiResponse<Void>> reject(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @PathVariable Long id) { service.processRequest(u.getId(), groupId, id, false); return done(); }
    @PostMapping("/join-requests/approve-all") public ResponseEntity<ApiResponse<Void>> approveAll(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId) { service.processAllRequests(u.getId(), groupId, true); return done(); }
    @PostMapping("/join-requests/reject-all") public ResponseEntity<ApiResponse<Void>> rejectAll(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId) { service.processAllRequests(u.getId(), groupId, false); return done(); }

    @GetMapping("/operation-logs") public ResponseEntity<ApiResponse<Map<String, Object>>> logs(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "11") int size) { return ok(service.operationLogs(u.getId(), groupId, page, size)); }
    @GetMapping("/settings") public ResponseEntity<ApiResponse<Map<String, Object>>> settings(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId) { return ok(service.settings(u.getId(), groupId)); }
    @GetMapping("/deletion-summary") public ResponseEntity<ApiResponse<Map<String, Object>>> deletionSummary(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId) { return ok(service.deletionSummary(u.getId(), groupId)); }
    @PutMapping("/settings/basic") public ResponseEntity<ApiResponse<Void>> basic(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestBody Map<String, Object> b) { service.basicSettings(u.getId(), groupId, b); return done(); }
    @PutMapping("/settings/join") public ResponseEntity<ApiResponse<Void>> join(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestBody Map<String, Object> b) { service.joinSettings(u.getId(), groupId, b); return done(); }
    @PutMapping("/settings/schedule") public ResponseEntity<ApiResponse<Void>> scheduleSettings(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestBody Map<String, Object> b) { service.scheduleSettings(u.getId(), groupId, b); return done(); }
    @PutMapping("/settings/board") public ResponseEntity<ApiResponse<Void>> boardSettings(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestBody Map<String, Object> b) { service.boardSettings(u.getId(), groupId, b); return done(); }
    @PutMapping("/image") public ResponseEntity<ApiResponse<Map<String, Object>>> image(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId, @RequestParam("image") MultipartFile image) { String url = imageService.upload(image); service.image(u.getId(), groupId, url); return ok(Map.of("imageUrl", url)); }
    @DeleteMapping("/image") public ResponseEntity<ApiResponse<Void>> resetImage(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId) { service.image(u.getId(), groupId, null); return done(); }
    @DeleteMapping public ResponseEntity<ApiResponse<Void>> deleteGroup(@AuthenticationPrincipal CustomUserDetails u, @PathVariable Long groupId) { service.deleteGroup(u.getId(), groupId); return done(); }

    private static <T> ResponseEntity<ApiResponse<T>> ok(T data) { return ResponseEntity.ok(ApiResponse.success("Request completed.", data)); }
    private static ResponseEntity<ApiResponse<Void>> done() { return ResponseEntity.ok(ApiResponse.success("Request completed.", null)); }
}
