package com.shuttleplay.server.domain.group.service;

import com.shuttleplay.server.domain.group.entity.*;
import com.shuttleplay.server.domain.group.enums.*;
import com.shuttleplay.server.domain.group.repository.*;
import com.shuttleplay.server.domain.notification.enums.NotificationType;
import com.shuttleplay.server.domain.notification.service.NotificationService;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.*;
import com.shuttleplay.server.global.error.*;
import java.time.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupDetailService {
    private final GroupAccessService access;
    private final GroupRepository groups;
    private final GroupMemberRepository members;
    private final GroupSessionRepository sessions;
    private final GroupSessionVoteRepository votes;
    private final GroupSessionGuestRepository guests;
    private final GroupPostRepository posts;
    private final GroupCommentRepository comments;
    private final GroupJoinRequestRepository joinRequests;
    private final GroupOperationLogRepository logs;
    private final NotificationService notifications;
    private final GroupNotificationDispatchService notificationDispatch;
    private final GroupEventService events;

    @Transactional(readOnly = true)
    public Map<String, Object> group(Long userId, Long groupId) {
        GroupMember me = access.member(groupId, userId);
        Group group = me.getGroup();
        Map<String, Object> result = map();
        result.put("id", group.getId()); result.put("name", group.getName()); result.put("profileImageUrl", group.getProfileImageUrl());
        result.put("activityRegion", group.getActivityRegion()); result.put("description", group.getDescription());
        result.put("createdAt", group.getCreatedAt()); result.put("ownerName", group.getOwner().getName());
        result.put("memberCount", members.countByGroupIdAndStatus(groupId, GroupMemberStatus.ACTIVE));
        result.put("myMemberId", me.getId());
        result.put("myRole", me.getRole()); result.put("permissions", permissionMap(me));
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> dashboard(Long userId, Long groupId) {
        GroupMember me = access.member(groupId, userId);
        LocalDateTime now = LocalDateTime.now();
        List<GroupSession> recent = sessions.findAllByGroupIdAndStartsAtBetweenAndStatusAndIsDeletedFalse(groupId, now.minusDays(28), now, GroupSessionStatus.CLOSED);
        List<GroupMember> groupMembers = members.findAllByGroupIdAndStatus(groupId, GroupMemberStatus.ACTIVE);
        Map<String, Long> grades = groupMembers.stream().filter(m -> m.getUser().getGrade() != null)
                .collect(Collectors.groupingBy(m -> m.getUser().getGrade().name(), Collectors.counting()));
        List<Map<String, Object>> trend = new ArrayList<>();
        for (int week = 3; week >= 0; week--) {
            LocalDateTime from = now.minusWeeks(week + 1L);
            LocalDateTime to = now.minusWeeks(week);
            trend.add(Map.of("week", 4 - week, "attendance", sessions.findAllByGroupIdAndStartsAtBetweenAndStatusAndIsDeletedFalse(groupId, from, to, GroupSessionStatus.CLOSED).stream().mapToInt(GroupSession::getAttendanceCount).sum()));
        }
        Map<String, Object> result = map();
        result.put("upcomingSession", sessions.findAllByGroupIdAndStartsAtBetweenAndStatusInAndIsDeletedFalse(groupId, now, now.plusYears(1), List.of(GroupSessionStatus.CREATED, GroupSessionStatus.ATTENDANCE_OPEN)).stream().min(Comparator.comparing(GroupSession::getStartsAt)).map(this::sessionMap).orElse(null));
        result.put("recentSessions", sessions.findTop3ByGroupIdAndStatusAndIsDeletedFalseOrderByStartsAtDesc(groupId, GroupSessionStatus.CLOSED).stream().map(this::sessionMap).toList());
        result.put("recentFourWeekSessionCount", recent.size());
        result.put("averageAttendance", recent.isEmpty() ? 0 : Math.round(recent.stream().mapToInt(GroupSession::getAttendanceCount).average().orElse(0)));
        int myRecentParticipationCount = recentParticipationCount(me);
        result.put("peakActivityTime", peakTime(recent)); result.put("myRecentParticipationCount", myRecentParticipationCount);
        result.put("myMonthlyParticipationRate", recent.isEmpty() ? 0 : Math.round(myRecentParticipationCount * 100f / recent.size()));
        result.put("averageMatchCount", null);
        result.put("averageDoublesMmr", average(groupMembers, u -> u.getDoublesMmr())); result.put("averageMixedMmr", average(groupMembers, u -> u.getMixedMmr()));
        result.put("participationTrend", trend); result.put("gradeDistribution", grades);
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> operationGuide(Long userId, Long groupId) {
        Group group = access.member(groupId, userId).getGroup();
        Map<String, Object> result = map();
        result.put("content", Optional.ofNullable(group.getOperationNotice()).orElse(""));
        logs.findFirstByGroupIdAndActionOrderByCreatedAtDesc(groupId, "OPERATION_GUIDE_UPDATED").ifPresentOrElse(log -> {
            result.put("updatedAt", log.getCreatedAt());
            result.put("authorName", log.getActor().getUser().getName());
        }, () -> {
            boolean hasGuide = group.getOperationNotice() != null && !group.getOperationNotice().isBlank();
            result.put("updatedAt", hasGuide ? group.getCreatedAt() : null);
            result.put("authorName", hasGuide ? group.getOwner().getName() : null);
        });
        return result;
    }
    public void saveOperationGuide(Long userId, Long groupId, String content) {
        GroupMember actor = access.noticeManager(groupId, userId); actor.getGroup().updateOperationNotice(content); log(actor, "OPERATION_GUIDE_UPDATED", "운영 안내 변경"); notifyAll(actor.getGroup(), "운영 안내가 변경되었습니다."); events.group(groupId, "OPERATION_GUIDE_UPDATED");
    }
    public void deleteOperationGuide(Long userId, Long groupId) { saveOperationGuide(userId, groupId, null); }

    public void leave(Long userId, Long groupId) {
        GroupMember member = access.member(groupId, userId);
        if (member.getRole() == GroupMemberRole.OWNER) throw new BusinessException(ErrorCode.FORBIDDEN);
        member.leave(); events.members(groupId, "MEMBER_LEFT");
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> sessionList(Long userId, Long groupId, int year, int month, Integer day) {
        GroupMember member = access.member(groupId, userId);
        LocalDate fromDate = LocalDate.of(year, month, day == null ? 1 : day);
        LocalDate toDate = day == null ? fromDate.withDayOfMonth(fromDate.lengthOfMonth()) : fromDate;
        return sessions.findAllByGroupIdAndStartsAtBetweenAndIsDeletedFalse(groupId, fromDate.atStartOfDay(), toDate.atTime(LocalTime.MAX)).stream().map(session -> {
            Map<String, Object> result = sessionMap(session);
            result.put("myVoteStatus", votes.findBySessionIdAndMemberId(session.getId(), member.getId()).map(GroupSessionVote::getStatus).orElse(null));
            return result;
        }).toList();
    }
    @Transactional(readOnly = true)
    public Map<String, Object> monthlySummary(Long userId, Long groupId, int year, int month) {
        List<Map<String, Object>> list = sessionList(userId, groupId, year, month, null);
        long completed = list.stream().filter(s -> s.get("status") == GroupSessionStatus.CLOSED).count();
        long upcoming = list.stream().filter(s -> s.get("status") == GroupSessionStatus.CREATED || s.get("status") == GroupSessionStatus.ATTENDANCE_OPEN).count();
        int attendance = list.stream().filter(s -> s.get("status") != GroupSessionStatus.CANCELLED).mapToInt(s -> (int) s.get("attendanceCount")).sum();
        return Map.of("upcomingCount", upcoming, "completedCount", completed, "cumulativeAttendance", attendance);
    }
    @Transactional(readOnly = true)
    public Map<String, Object> session(Long userId, Long groupId, Long sessionId) { GroupMember member = access.member(groupId, userId); Map<String, Object> result = detailedSession(access.session(groupId, sessionId)); result.put("myVoteStatus", votes.findBySessionIdAndMemberId(sessionId, member.getId()).map(GroupSessionVote::getStatus).orElse(null)); return result; }
    public void updateSession(Long userId, Long groupId, Long sessionId, Map<String, Object> body) {
        GroupMember actor = access.scheduleManager(groupId, userId); GroupSession session = access.session(groupId, sessionId);
        session.update(text(body, "title"), dateTime(body, "startsAt"), dateTime(body, "endsAt"), text(body, "place"), dateTime(body, "voteDeadline"));
        log(actor, "SESSION_UPDATED", session.getTitle()); notifyAll(actor.getGroup(), "운동 일정이 변경되었습니다."); events.sessions(groupId, "SESSION_UPDATED");
    }
    public void cancelSession(Long userId, Long groupId, Long sessionId) { GroupMember actor = access.scheduleManager(groupId, userId); access.session(groupId, sessionId).cancel(); log(actor, "SESSION_CANCELLED", String.valueOf(sessionId)); notifyAll(actor.getGroup(), "운동 일정이 취소되었습니다."); events.sessions(groupId, "SESSION_CANCELLED"); }
    public void deleteSession(Long userId, Long groupId, Long sessionId) { GroupMember actor = access.scheduleManager(groupId, userId); access.session(groupId, sessionId).deleteSession(); log(actor, "SESSION_DELETED", String.valueOf(sessionId)); notifyAll(actor.getGroup(), "운동 일정이 삭제되었습니다."); events.sessions(groupId, "SESSION_DELETED"); }
    public void vote(Long userId, Long groupId, Long sessionId, SessionVoteStatus status) {
        GroupMember member = access.member(groupId, userId); GroupSession session = access.session(groupId, sessionId);
        LocalDateTime now = LocalDateTime.now();
        if (session.getVoteDeadline() != null && now.isAfter(session.getVoteDeadline()) && !member.getGroup().isPostDeadlineVoteChangeAllowed()) throw new BusinessException(ErrorCode.FORBIDDEN);
        if (session.getStartsAt().toLocalDate().equals(now.toLocalDate()) && !member.getGroup().isSameDayVoteChangeAllowed()) throw new BusinessException(ErrorCode.FORBIDDEN);
        votes.findBySessionIdAndMemberId(sessionId, member.getId()).ifPresentOrElse(v -> v.updateStatus(status), () -> votes.save(GroupSessionVote.create(session, member, status)));
        refreshAttendanceCount(session);
        events.sessions(groupId, "VOTE_UPDATED");
    }
    @Transactional(readOnly = true)
    public List<Map<String, Object>> participants(Long userId, Long groupId, Long sessionId, SessionVoteStatus status) {
        access.member(groupId, userId); access.session(groupId, sessionId);
        List<Map<String, Object>> result = new ArrayList<>(votes.findAllBySessionIdAndStatus(sessionId, status).stream().map(v -> memberMap(v.getMember(), v.getStatus())).toList());
        if (status == SessionVoteStatus.ATTENDING) result.addAll(guests.findAllBySessionId(sessionId).stream().map(this::guestParticipantMap).toList());
        return result;
    }
    public Map<String, Object> addGuest(Long userId, Long groupId, Long sessionId, Map<String, Object> body) {
        GroupMember actor = access.scheduleManager(groupId, userId);
        if (!actor.getGroup().isGuestAllowed()) throw new BusinessException(ErrorCode.FORBIDDEN);
        String name = text(body, "name");
        if (guests.existsBySessionIdAndNameIgnoreCase(sessionId, name)) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        GroupSession session = access.session(groupId, sessionId);
        GroupSessionGuest guest = guests.save(GroupSessionGuest.create(session, name, Gender.valueOf(text(body, "gender")), AgeGroup.valueOf(text(body, "ageGroup")), Grade.valueOf(text(body, "grade"))));
        refreshAttendanceCount(session); log(actor, "GUEST_ADDED", name); events.sessions(groupId, "GUEST_ADDED"); return guestMap(guest);
    }
    public void updateGuest(Long userId, Long groupId, Long sessionId, Long guestId, Map<String, Object> body) { GroupMember actor = access.scheduleManager(groupId, userId); access.session(groupId, sessionId); GroupSessionGuest guest = guests.findByIdAndSessionId(guestId, sessionId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); String name = text(body, "name"); if (guests.existsBySessionIdAndNameIgnoreCaseAndIdNot(sessionId, name, guestId)) throw new BusinessException(ErrorCode.INVALID_REQUEST); guest.update(name, Gender.valueOf(text(body, "gender")), AgeGroup.valueOf(text(body, "ageGroup")), Grade.valueOf(text(body, "grade"))); log(actor, "GUEST_UPDATED", name); events.sessions(groupId, "GUEST_UPDATED"); }
    public void deleteGuest(Long userId, Long groupId, Long sessionId, Long guestId) { GroupMember actor = access.scheduleManager(groupId, userId); GroupSession session = access.session(groupId, sessionId); GroupSessionGuest guest = guests.findByIdAndSessionId(guestId, sessionId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); guests.delete(guest); guests.flush(); refreshAttendanceCount(session); log(actor, "GUEST_DELETED", guest.getName()); events.sessions(groupId, "GUEST_DELETED"); }

    @Transactional(readOnly = true)
    public Map<String, Object> postList(Long userId, Long groupId, String keyword, GroupPostType type, int page, int size) {
        access.member(groupId, userId); Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("pinned"), Sort.Order.desc("createdAt")));
        Page<GroupPost> result = type == null ? posts.findAllByGroupIdAndTitleContainingIgnoreCaseAndIsDeletedFalse(groupId, keyword, pageable) : posts.findAllByGroupIdAndTypeAndTitleContainingIgnoreCaseAndIsDeletedFalse(groupId, type, keyword, pageable);
        return page(result, p -> postMap(p, comments.countByPostIdAndIsDeletedFalse(p.getId())));
    }
    public Map<String, Object> post(Long userId, Long groupId, Long postId) { access.member(groupId, userId); GroupPost post = access.post(groupId, postId); post.increaseViewCount(); return postMap(post, comments.countByPostIdAndIsDeletedFalse(postId)); }
    public Map<String, Object> createPost(Long userId, Long groupId, Map<String, Object> body) { GroupMember author = access.member(groupId, userId); GroupPostType type = GroupPostType.valueOf(text(body, "type")); if (type == GroupPostType.NOTICE || bool(body, "pinned")) access.postManager(groupId, userId); else if (!author.getGroup().isMemberPostAllowed() && author.getRole() == GroupMemberRole.MEMBER) throw new BusinessException(ErrorCode.FORBIDDEN); if (textOrNull(body, "attachmentNames") != null && !author.getGroup().isPostAttachmentAllowed()) throw new BusinessException(ErrorCode.FORBIDDEN); GroupPost post = posts.save(GroupPost.create(author.getGroup(), author, type, text(body, "title"), text(body, "content"), bool(body, "pinned"), textOrNull(body, "attachmentNames"))); if (post.getType() == GroupPostType.NOTICE) notifyAll(author.getGroup(), "새 공지사항이 등록되었습니다."); log(author, "POST_CREATED", post.getTitle()); events.posts(groupId, "POST_CREATED"); return postMap(post, 0); }
    @Transactional(readOnly = true)
    public void assertPostAttachmentAllowed(Long userId, Long groupId) { if (!access.member(groupId, userId).getGroup().isPostAttachmentAllowed()) throw new BusinessException(ErrorCode.FORBIDDEN); }
    public void updatePost(Long userId, Long groupId, Long postId, Map<String, Object> body) { GroupMember actor = access.member(groupId, userId); GroupPost post = access.post(groupId, postId); requireAuthorOrPostManager(groupId, userId, actor, post.getAuthor()); if (post.isPinned() != bool(body, "pinned") || GroupPostType.valueOf(text(body, "type")) == GroupPostType.NOTICE) access.postManager(groupId, userId); String attachmentNames = body.containsKey("attachmentNames") ? textOrNull(body, "attachmentNames") : post.getAttachmentNames(); post.update(GroupPostType.valueOf(text(body, "type")), text(body, "title"), text(body, "content"), bool(body, "pinned"), attachmentNames); log(actor, "POST_UPDATED", post.getTitle()); events.posts(groupId, "POST_UPDATED"); }
    public void deletePost(Long userId, Long groupId, Long postId) { GroupMember actor = access.member(groupId, userId); GroupPost post = access.post(groupId, postId); requireAuthorOrPostManager(groupId, userId, actor, post.getAuthor()); post.softDelete(); log(actor, "POST_DELETED", post.getTitle()); events.posts(groupId, "POST_DELETED"); }
    public void pinPost(Long userId, Long groupId, Long postId) { GroupMember actor = access.postManager(groupId, userId); GroupPost post = access.post(groupId, postId); post.togglePin(); log(actor, "POST_PIN_UPDATED", post.getTitle()); events.posts(groupId, "POST_PIN_UPDATED"); }
    @Transactional(readOnly = true)
    public List<Map<String, Object>> commentList(Long userId, Long groupId, Long postId) { access.member(groupId, userId); access.post(groupId, postId); return comments.findAllByPostIdAndIsDeletedFalseOrderByCreatedAtAsc(postId).stream().map(this::commentMap).toList(); }
    public Map<String, Object> createComment(Long userId, Long groupId, Long postId, Long parentId, String content) { GroupMember author = access.member(groupId, userId); if (!author.getGroup().isMemberCommentAllowed() && author.getRole() == GroupMemberRole.MEMBER) throw new BusinessException(ErrorCode.FORBIDDEN); GroupPost post = access.post(groupId, postId); GroupComment parent = parentId == null ? null : comments.findByIdAndPostIdAndIsDeletedFalse(parentId, postId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); GroupComment comment = comments.save(GroupComment.create(post, author, parent, content)); notifyCommentTarget(post, parent, author); events.posts(groupId, "COMMENT_CREATED"); return commentMap(comment); }
    public void updateComment(Long userId, Long groupId, Long postId, Long commentId, String content) { GroupMember actor = access.member(groupId, userId); GroupComment comment = comments.findByIdAndPostIdAndIsDeletedFalse(commentId, postId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); requireAuthorOrPostManager(groupId, userId, actor, comment.getAuthor()); comment.update(content); events.posts(groupId, "COMMENT_UPDATED"); }
    public void deleteComment(Long userId, Long groupId, Long postId, Long commentId) { GroupMember actor = access.member(groupId, userId); GroupComment comment = comments.findByIdAndPostIdAndIsDeletedFalse(commentId, postId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); requireAuthorOrPostManager(groupId, userId, actor, comment.getAuthor()); comment.softDelete(); events.posts(groupId, "COMMENT_DELETED"); }

    @Transactional(readOnly = true)
    public Map<String, Object> memberList(Long userId, Long groupId, String keyword, GroupMemberRole role, Grade grade, int page, int size) {
        access.member(groupId, userId);
        return page(members.findGroupMembers(groupId, GroupMemberStatus.ACTIVE, keyword, role, grade, PageRequest.of(page, size)), m -> memberMap(m, null));
    }
    @Transactional(readOnly = true)
    public Map<String, Object> member(Long userId, Long groupId, Long memberId) {
        GroupMember requester = access.member(groupId, userId);
        GroupMember target = access.targetMember(groupId, memberId);
        Map<String, Object> result = memberMap(target, null);
        if (requester.getRole() != GroupMemberRole.MEMBER) result.put("memo", target.getMemo());
        return result;
    }
    public void memo(Long userId, Long groupId, Long memberId, String memo) { GroupMember actor = access.memberManager(groupId, userId); GroupMember target = access.targetMember(groupId, memberId); target.updateMemo(memo); log(actor, "MEMBER_MEMO_UPDATED", target.getUser().getName()); }
    public void role(Long userId, Long groupId, Long memberId, GroupMemberRole role) { GroupMember actor = access.owner(groupId, userId); GroupMember target = access.targetMember(groupId, memberId); if (target.getRole() == GroupMemberRole.OWNER || role == GroupMemberRole.OWNER) throw new BusinessException(ErrorCode.FORBIDDEN); target.updateRole(role); if (role == GroupMemberRole.MEMBER) target.updatePermissions(false, false, false, false, false, false); log(actor, "ROLE_UPDATED", target.getUser().getName()); notifyAll(actor.getGroup(), "멤버 역할이 변경되었습니다."); events.members(groupId, "ROLE_UPDATED"); }
    @Transactional(readOnly = true)
    public Map<String, Object> permissions(Long userId, Long groupId, Long memberId) { access.owner(groupId, userId); return permissionMap(access.targetMember(groupId, memberId)); }
    public void permissions(Long userId, Long groupId, Long memberId, Map<String, Object> body) { GroupMember actor = access.owner(groupId, userId); GroupMember target = access.targetMember(groupId, memberId); if (target.getRole() != GroupMemberRole.MANAGER) throw new BusinessException(ErrorCode.INVALID_REQUEST); target.updatePermissions(bool(body, "schedule"), bool(body, "notice"), bool(body, "joinRequests"), bool(body, "members"), bool(body, "posts"), bool(body, "operationLogs")); log(actor, "PERMISSIONS_UPDATED", target.getUser().getName()); notifyAll(actor.getGroup(), "매니저 권한이 변경되었습니다."); events.members(groupId, "PERMISSIONS_UPDATED"); }
    public void transferOwner(Long userId, Long groupId, Long memberId) { GroupMember actor = access.owner(groupId, userId); GroupMember target = access.targetMember(groupId, memberId); if (target.getId().equals(actor.getId())) throw new BusinessException(ErrorCode.INVALID_REQUEST); actor.updateRole(GroupMemberRole.MANAGER); target.updateRole(GroupMemberRole.OWNER); actor.getGroup().transferOwnership(target.getUser()); log(actor, "OWNER_TRANSFERRED", target.getUser().getName()); notifyAll(target.getGroup(), "모임 소유권이 이전되었습니다."); events.members(groupId, "OWNER_TRANSFERRED"); }
    public void removeMember(Long userId, Long groupId, Long memberId) { GroupMember actor = access.memberManager(groupId, userId); GroupMember target = access.targetMember(groupId, memberId); if (target.getRole() == GroupMemberRole.OWNER || target.getId().equals(actor.getId()) || (actor.getRole() == GroupMemberRole.MANAGER && target.getRole() == GroupMemberRole.MANAGER)) throw new BusinessException(ErrorCode.FORBIDDEN); target.leave(); notifications.send(target.getUser(), NotificationType.GROUP, "모임 강제 탈퇴", actor.getGroup().getName() + " 모임에서 탈퇴 처리되었습니다.", "/groups"); log(actor, "MEMBER_REMOVED", target.getUser().getName()); events.members(groupId, "MEMBER_REMOVED"); }

    @Transactional(readOnly = true)
    public Map<String, Object> requestList(Long userId, Long groupId, int page, int size) { access.joinRequestManager(groupId, userId); return page(joinRequests.findAllByGroupIdAndStatusOrderByCreatedAtDesc(groupId, JoinRequestStatus.PENDING, PageRequest.of(page, size)), this::requestMap); }
    public void processRequest(Long userId, Long groupId, Long requestId, boolean approve) { GroupMember actor = access.joinRequestManager(groupId, userId); GroupJoinRequest request = joinRequests.findByIdAndGroupIdAndStatus(requestId, groupId, JoinRequestStatus.PENDING).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); if (approve) { request.approve(); members.findByGroupIdAndUserId(groupId, request.getRequester().getId()).ifPresentOrElse(GroupMember::reactivate, () -> members.save(GroupMember.createMember(actor.getGroup(), request.getRequester()))); } else request.reject(); notificationDispatch.notifyManagers(actor.getGroup(), approve ? "JOIN_APPROVED:" + requestId : "JOIN_REJECTED:" + requestId, request.getRequester().getName() + "님의 가입 요청이 처리되었습니다."); log(actor, approve ? "JOIN_APPROVED" : "JOIN_REJECTED", request.getRequester().getName()); events.joinRequests(groupId, "JOIN_REQUEST_PROCESSED"); }
    public void processAllRequests(Long userId, Long groupId, boolean approve) { access.joinRequestManager(groupId, userId); joinRequests.findAllByGroupIdAndStatus(groupId, JoinRequestStatus.PENDING).forEach(request -> processRequest(userId, groupId, request.getId(), approve)); }

    @Transactional(readOnly = true)
    public Map<String, Object> operationLogs(Long userId, Long groupId, int page, int size) { access.operationLogManager(groupId, userId); return page(logs.findAllByGroupIdOrderByCreatedAtDesc(groupId, PageRequest.of(page, size)), l -> Map.of("id", l.getId(), "actorName", l.getActor().getUser().getName(), "action", operationActionLabel(l.getAction()), "detail", l.getDetail(), "createdAt", l.getCreatedAt())); }
    @Transactional(readOnly = true)
    public Map<String, Object> settings(Long userId, Long groupId) { Group group = access.owner(groupId, userId).getGroup(); Map<String, Object> result = group(userId, groupId); result.put("newJoinAllowed", group.isNewJoinAllowed()); result.put("approvalRequired", group.isApprovalRequired()); result.put("guestAllowed", group.isGuestAllowed()); result.put("sameDayVoteChangeAllowed", group.isSameDayVoteChangeAllowed()); result.put("postDeadlineVoteChangeAllowed", group.isPostDeadlineVoteChangeAllowed()); result.put("memberPostAllowed", group.isMemberPostAllowed()); result.put("memberCommentAllowed", group.isMemberCommentAllowed()); result.put("postAttachmentAllowed", group.isPostAttachmentAllowed()); return result; }
    @Transactional(readOnly = true)
    public Map<String, Object> deletionSummary(Long userId, Long groupId) { access.owner(groupId, userId); return Map.of("upcomingCount", sessions.countByGroupIdAndStartsAtAfterAndStatusInAndIsDeletedFalse(groupId, LocalDateTime.now(), List.of(GroupSessionStatus.CREATED, GroupSessionStatus.ATTENDANCE_OPEN)), "inProgressCount", sessions.countByGroupIdAndStatusAndIsDeletedFalse(groupId, GroupSessionStatus.IN_PROGRESS)); }
    public void basicSettings(Long userId, Long groupId, Map<String, Object> body) { GroupMember actor = access.owner(groupId, userId); Group group = actor.getGroup(); String name = text(body, "name"); String activityRegion = text(body, "activityRegion"); String description = text(body, "description"); String detail = changedFields(fieldChange("모임명", group.getName(), name), fieldChange("활동 지역", group.getActivityRegion(), activityRegion), fieldChange("모임 설명", group.getDescription(), description)); group.updateBasic(name, activityRegion, description); log(actor, "BASIC_UPDATED", detail); events.group(groupId, "BASIC_UPDATED"); }
    public void joinSettings(Long userId, Long groupId, Map<String, Object> body) { GroupMember actor = access.owner(groupId, userId); Group group = actor.getGroup(); boolean newJoinAllowed = bool(body, "newJoinAllowed"); boolean approvalRequired = bool(body, "approvalRequired"); boolean guestAllowed = bool(body, "guestAllowed"); String detail = changedFields(settingChange("신규 가입", group.isNewJoinAllowed(), newJoinAllowed), settingChange("승인 후 가입", group.isApprovalRequired(), approvalRequired), settingChange("게스트 일정 참여", group.isGuestAllowed(), guestAllowed)); group.updateJoinSettings(newJoinAllowed, approvalRequired, guestAllowed); log(actor, "JOIN_SETTINGS_UPDATED", detail); events.group(groupId, "JOIN_SETTINGS_UPDATED"); }
    public void scheduleSettings(Long userId, Long groupId, Map<String, Object> body) { GroupMember actor = access.owner(groupId, userId); Group group = actor.getGroup(); boolean sameDayVoteChangeAllowed = bool(body, "sameDayVoteChangeAllowed"); boolean postDeadlineVoteChangeAllowed = bool(body, "postDeadlineVoteChangeAllowed"); String detail = changedFields(settingChange("일정 당일 투표 변경", group.isSameDayVoteChangeAllowed(), sameDayVoteChangeAllowed), settingChange("투표 마감 후 변경", group.isPostDeadlineVoteChangeAllowed(), postDeadlineVoteChangeAllowed)); group.updateScheduleSettings(sameDayVoteChangeAllowed, postDeadlineVoteChangeAllowed); log(actor, "SCHEDULE_SETTINGS_UPDATED", detail); events.group(groupId, "SCHEDULE_SETTINGS_UPDATED"); }
    public void boardSettings(Long userId, Long groupId, Map<String, Object> body) { GroupMember actor = access.owner(groupId, userId); Group group = actor.getGroup(); boolean memberPostAllowed = bool(body, "memberPostAllowed"); boolean memberCommentAllowed = bool(body, "memberCommentAllowed"); boolean postAttachmentAllowed = bool(body, "postAttachmentAllowed"); String detail = changedFields(settingChange("멤버 게시글 작성", group.isMemberPostAllowed(), memberPostAllowed), settingChange("멤버 댓글 작성", group.isMemberCommentAllowed(), memberCommentAllowed), settingChange("게시글 파일 첨부", group.isPostAttachmentAllowed(), postAttachmentAllowed)); group.updateBoardSettings(memberPostAllowed, memberCommentAllowed, postAttachmentAllowed); log(actor, "BOARD_SETTINGS_UPDATED", detail); events.group(groupId, "BOARD_SETTINGS_UPDATED"); }
    public void image(Long userId, Long groupId, String url) { GroupMember actor = access.owner(groupId, userId); actor.getGroup().updateProfileImageUrl(url); log(actor, "IMAGE_UPDATED", url == null ? "대표 이미지 기본값 복원" : "대표 이미지 변경"); events.group(groupId, "IMAGE_UPDATED"); }
    public void deleteGroup(Long userId, Long groupId) { GroupMember actor = access.owner(groupId, userId); notifyAll(actor.getGroup(), "모임이 삭제되었습니다."); actor.getGroup().deactivate(); log(actor, "GROUP_DELETED", actor.getGroup().getName()); events.group(groupId, "GROUP_DELETED"); }

    private Map<String, Object> detailedSession(GroupSession s) { Map<String, Object> m = sessionMap(s); m.put("attending", votes.countBySessionIdAndStatus(s.getId(), SessionVoteStatus.ATTENDING)); m.put("undecided", votes.countBySessionIdAndStatus(s.getId(), SessionVoteStatus.UNDECIDED)); m.put("absent", votes.countBySessionIdAndStatus(s.getId(), SessionVoteStatus.ABSENT)); m.put("guests", guests.findAllBySessionId(s.getId()).stream().map(this::guestMap).toList()); return m; }
    private Map<String, Object> sessionMap(GroupSession s) { Map<String, Object> m = map(); m.put("id", s.getId()); m.put("title", s.getTitle()); m.put("startsAt", s.getStartsAt()); m.put("endsAt", s.getEndsAt()); m.put("place", s.getPlace()); m.put("voteDeadline", s.getVoteDeadline()); m.put("attendanceCount", s.getAttendanceCount()); m.put("attending", votes.countBySessionIdAndStatus(s.getId(), SessionVoteStatus.ATTENDING)); m.put("undecided", votes.countBySessionIdAndStatus(s.getId(), SessionVoteStatus.UNDECIDED)); m.put("absent", votes.countBySessionIdAndStatus(s.getId(), SessionVoteStatus.ABSENT)); m.put("guestCount", guests.findAllBySessionId(s.getId()).size()); m.put("status", s.getStatus()); return m; }
    private Map<String, Object> memberMap(GroupMember m, SessionVoteStatus status) { Map<String, Object> x = map(); User u = m.getUser(); int recentCount = recentParticipationCount(m); long recentSessions = sessions.findAllByGroupIdAndStartsAtBetweenAndStatusAndIsDeletedFalse(m.getGroup().getId(), LocalDateTime.now().minusDays(28), LocalDateTime.now(), GroupSessionStatus.CLOSED).size(); x.put("id", m.getId()); x.put("name", u.getName()); x.put("profileImageUrl", u.getProfileImageUrl()); x.put("gender", u.getGender()); x.put("ageGroup", u.getAgeGroup()); x.put("grade", u.getGrade()); x.put("role", m.getRole()); x.put("participationCount", votes.countByMemberIdAndStatusAndSession_Status(m.getId(), SessionVoteStatus.ATTENDING, GroupSessionStatus.CLOSED)); x.put("monthlyParticipationRate", recentSessions == 0 ? 0 : Math.round(recentCount * 100f / recentSessions)); x.put("recentFourWeekParticipationCount", recentCount); x.put("doublesMmr", u.getDoublesMmr()); x.put("mixedMmr", u.getMixedMmr()); x.put("voteStatus", status); return x; }
    private Map<String, Object> guestMap(GroupSessionGuest g) { return Map.of("id", g.getId(), "name", g.getName(), "gender", g.getGender(), "ageGroup", g.getAgeGroup(), "grade", g.getGrade(), "status", g.getStatus()); }
    private Map<String, Object> guestParticipantMap(GroupSessionGuest g) { Map<String, Object> x = map(); x.putAll(guestMap(g)); x.put("guest", true); x.put("profileImageUrl", null); x.put("role", "GUEST"); x.put("voteStatus", g.getStatus()); return x; }
    private Map<String, Object> postMap(GroupPost p, long count) { Map<String, Object> x = map(); x.put("id", p.getId()); x.put("type", p.getType()); x.put("title", p.getTitle()); x.put("content", p.getContent()); x.put("pinned", p.isPinned()); x.put("viewCount", p.getViewCount()); x.put("commentCount", count); x.put("authorId", p.getAuthor().getId()); x.put("authorName", p.getAuthor().getUser().getName()); x.put("attachmentNames", p.getAttachmentNames()); x.put("createdAt", p.getCreatedAt()); return x; }
    private Map<String, Object> commentMap(GroupComment c) { return Map.of("id", c.getId(), "parentId", c.getParent() == null ? 0 : c.getParent().getId(), "authorId", c.getAuthor().getId(), "authorName", c.getAuthor().getUser().getName(), "content", c.getContent(), "createdAt", c.getCreatedAt()); }
    private Map<String, Object> requestMap(GroupJoinRequest r) { User u = r.getRequester(); return Map.of("id", r.getId(), "name", u.getName(), "gender", String.valueOf(u.getGender()), "ageGroup", String.valueOf(u.getAgeGroup()), "grade", String.valueOf(u.getGrade()), "message", Optional.ofNullable(r.getMessage()).orElse(""), "requestedAt", r.getCreatedAt()); }
    private Map<String, Object> permissionMap(GroupMember m) { return Map.of("schedule", m.isSchedulePermission(), "notice", m.isNoticePermission(), "joinRequests", m.isJoinRequestPermission(), "members", m.isMemberPermission(), "posts", m.isPostPermission(), "operationLogs", m.isOperationLogPermission()); }
    private <T> Map<String, Object> page(Page<T> p, Function<T, Map<String, Object>> mapper) { return Map.of("items", p.stream().map(mapper).toList(), "page", p.getNumber(), "size", p.getSize(), "totalElements", p.getTotalElements(), "totalPages", p.getTotalPages()); }
    private int average(List<GroupMember> list, Function<User, Integer> getter) { return list.isEmpty() ? 0 : (int) Math.round(list.stream().map(GroupMember::getUser).map(getter).mapToInt(Integer::intValue).average().orElse(0)); }
    private String peakTime(List<GroupSession> list) { return list.isEmpty() ? "기록 없음" : list.stream().collect(Collectors.groupingBy(s -> s.getStartsAt().getDayOfWeek() + " " + s.getStartsAt().getHour(), Collectors.counting())).entrySet().stream().max(Map.Entry.comparingByValue()).orElseThrow().getKey(); }
    private void requireAuthorOrPostManager(Long groupId, Long userId, GroupMember actor, GroupMember author) { if (!Objects.equals(actor.getId(), author.getId())) access.postManager(groupId, userId); }
    private String operationActionLabel(String action) {
        return switch (action) {
            case "OPERATION_GUIDE_UPDATED" -> "운영 안내 변경";
            case "SESSION_UPDATED" -> "운동 일정 변경";
            case "SESSION_CANCELLED" -> "운동 일정 취소";
            case "SESSION_DELETED" -> "운동 일정 삭제";
            case "ROLE_UPDATED" -> "멤버 역할 변경";
            case "PERMISSIONS_UPDATED" -> "매니저 권한 변경";
            case "OWNER_TRANSFERRED" -> "소유권 이전";
            case "MEMBER_REMOVED" -> "멤버 강제 탈퇴";
            case "JOIN_APPROVED" -> "가입 요청 승인";
            case "JOIN_REJECTED" -> "가입 요청 거절";
            case "BASIC_UPDATED" -> "기본 정보 변경";
            case "JOIN_SETTINGS_UPDATED" -> "가입 및 참여 설정 변경";
            case "SCHEDULE_SETTINGS_UPDATED" -> "일정 운영 설정 변경";
            case "BOARD_SETTINGS_UPDATED" -> "게시판 운영 설정 변경";
            case "IMAGE_UPDATED" -> "대표 이미지 변경";
            case "GROUP_DELETED" -> "모임 삭제";
            case "GUEST_ADDED" -> "게스트 추가";
            case "GUEST_UPDATED" -> "게스트 정보 변경";
            case "GUEST_DELETED" -> "게스트 삭제";
            case "POST_CREATED" -> "게시글 등록";
            case "POST_UPDATED" -> "게시글 변경";
            case "POST_DELETED" -> "게시글 삭제";
            case "POST_PIN_UPDATED" -> "게시글 고정 변경";
            case "MEMBER_MEMO_UPDATED" -> "멤버 메모 변경";
            default -> "모임 운영 변경";
        };
    }
    private String fieldChange(String label, Object before, Object after) { return Objects.equals(before, after) ? null : label + " 변경"; }
    private String settingChange(String label, boolean before, boolean after) { return before == after ? null : label + ": " + (after ? "허용" : "비허용"); }
    private String changedFields(String... changes) { String result = Arrays.stream(changes).filter(Objects::nonNull).collect(Collectors.joining(", ")); return result.isBlank() ? "변경 사항 없음" : result; }
    private void refreshAttendanceCount(GroupSession session) { session.updateAttendanceCount((int) votes.countBySessionIdAndStatus(session.getId(), SessionVoteStatus.ATTENDING) + guests.findAllBySessionId(session.getId()).size()); }
    private int recentParticipationCount(GroupMember member) { return (int) votes.countByMemberIdAndStatusAndSession_StartsAtBetweenAndSession_Status(member.getId(), SessionVoteStatus.ATTENDING, LocalDateTime.now().minusDays(28), LocalDateTime.now(), GroupSessionStatus.CLOSED); }
    private void log(GroupMember actor, String action, String detail) { logs.save(GroupOperationLog.create(actor.getGroup(), actor, action, detail)); }
    private void notifyAll(Group group, String message) { members.findAllByGroupIdAndStatus(group.getId(), GroupMemberStatus.ACTIVE).forEach(m -> notifications.send(m.getUser(), NotificationType.GROUP, group.getName(), message, "/groups/" + group.getId())); }
    private void notifyCommentTarget(GroupPost post, GroupComment parent, GroupMember author) { GroupMember target = parent == null ? post.getAuthor() : parent.getAuthor(); if (!Objects.equals(target.getId(), author.getId())) notifications.send(target.getUser(), NotificationType.GROUP, "새 댓글 알림", post.getTitle(), "/groups/" + post.getGroup().getId() + "/board"); }
    private static Map<String, Object> map() { return new LinkedHashMap<>(); }
    private static String text(Map<String, Object> b, String k) { Object v = b.get(k); if (v == null || String.valueOf(v).isBlank()) throw new BusinessException(ErrorCode.INVALID_REQUEST); return String.valueOf(v).trim(); }
    private static String textOrNull(Map<String, Object> b, String k) { Object v = b.get(k); return v == null ? null : String.valueOf(v); }
    private static boolean bool(Map<String, Object> b, String k) { return Boolean.TRUE.equals(b.get(k)); }
    private static LocalDateTime dateTime(Map<String, Object> b, String k) { Object v = b.get(k); return v == null || String.valueOf(v).isBlank() ? null : LocalDateTime.parse(String.valueOf(v)); }
}
