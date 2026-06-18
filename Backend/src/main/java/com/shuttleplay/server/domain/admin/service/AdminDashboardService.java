package com.shuttleplay.server.domain.admin.service;

import com.shuttleplay.server.domain.group.entity.Group;
import com.shuttleplay.server.domain.group.entity.GroupSession;
import com.shuttleplay.server.domain.group.repository.GroupRepository;
import com.shuttleplay.server.domain.group.repository.GroupSessionRepository;
import com.shuttleplay.server.domain.group.entity.GroupOperationLog;
import com.shuttleplay.server.domain.group.repository.GroupOperationLogRepository;
import com.shuttleplay.server.domain.inquiry.entity.Inquiry;
import com.shuttleplay.server.domain.inquiry.repository.InquiryRepository;
import com.shuttleplay.server.domain.notification.entity.Notification;
import com.shuttleplay.server.domain.notification.repository.NotificationRepository;
import com.shuttleplay.server.domain.notification.repository.PushSubscriptionRepository;
import com.shuttleplay.server.domain.group.enums.GroupStatus;
import com.shuttleplay.server.domain.group.enums.GroupSessionStatus;
import com.shuttleplay.server.domain.inquiry.enums.InquiryStatus;
import com.shuttleplay.server.domain.inquiry.enums.InquiryCategory;
import com.shuttleplay.server.domain.notification.enums.NotificationType;
import com.shuttleplay.server.domain.notification.service.NotificationService;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.UserRole;
import com.shuttleplay.server.domain.user.enums.UserStatus;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.domain.record.entity.MatchRecord;
import com.shuttleplay.server.domain.record.entity.MmrHistory;
import com.shuttleplay.server.domain.record.repository.MatchRecordRepository;
import com.shuttleplay.server.domain.record.repository.MmrHistoryRepository;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {
    private final UserRepository users;
    private final GroupRepository groups;
    private final GroupSessionRepository sessions;
    private final InquiryRepository inquiries;
    private final NotificationRepository notifications;
    private final PushSubscriptionRepository pushSubscriptions;
    private final MatchRecordRepository matches;
    private final MmrHistoryRepository mmrHistories;
    private final GroupOperationLogRepository operationLogs;
    private final Environment environment;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public Map<String, Object> section(Long actorId, String section, String keyword, UserRole role, UserStatus userStatus,
                                       InquiryStatus inquiryStatus, InquiryCategory category, int page, int size) {
        admin(actorId);
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(size, 1), 50);
        return switch (section) {
            case "home" -> home();
            case "users" -> userPage(keyword, role, userStatus, safePage, safeSize);
            case "groups" -> groupPage(keyword, safePage, safeSize);
            case "sessions" -> sessionPage(keyword, safePage, safeSize);
            case "matches" -> matchPage(safePage, safeSize);
            case "records" -> recordPage(safePage, safeSize);
            case "notifications" -> notificationPage(keyword, safePage, safeSize);
            case "inquiries" -> inquiryPage(keyword, inquiryStatus, category, safePage, safeSize);
            case "system" -> system(section);
            case "logs" -> logPage(safePage, safeSize);
            default -> emptySection(section, safePage, safeSize);
        };
    }

    public Map<String, Object> userDetail(Long actorId, Long userId) {
        admin(actorId);
        return userDetailMap(user(userId));
    }

    @Transactional
    public Map<String, Object> updateUserRole(Long actorId, Long userId, UserRole role) {
        User actor = admin(actorId);
        User target = user(userId);
        if (actor.getId().equals(target.getId()) && role != UserRole.ADMIN) throw new BusinessException(ErrorCode.FORBIDDEN);
        protectLastAdmin(target, role != UserRole.ADMIN);
        target.updateRole(role);
        publishUser("ROLE_UPDATED", target.getId());
        return userDetailMap(target);
    }

    @Transactional
    public Map<String, Object> updateUserStatus(Long actorId, Long userId, UserStatus status) {
        User actor = admin(actorId);
        User target = user(userId);
        if (status == UserStatus.DELETED || actor.getId().equals(target.getId())) throw new BusinessException(ErrorCode.FORBIDDEN);
        protectLastAdmin(target, status != UserStatus.ACTIVE);
        if (target.getStatus() == UserStatus.DELETED) throw new BusinessException(ErrorCode.CONFLICT);
        if (status == UserStatus.ACTIVE) target.activate(); else target.deactivate();
        publishUser("STATUS_UPDATED", target.getId());
        return userDetailMap(target);
    }

    @Transactional
    public void deleteUser(Long actorId, Long userId) {
        User actor = admin(actorId);
        User target = user(userId);
        if (actor.getId().equals(target.getId())) throw new BusinessException(ErrorCode.FORBIDDEN);
        protectLastAdmin(target, true);
        target.deleteUser();
        publishUser("DELETED", target.getId());
    }

    @Transactional
    public Map<String, Object> updateGroupStatus(Long actorId, Long groupId, GroupStatus status) {
        admin(actorId);
        Group group = groups.findById(groupId).orElseThrow(() -> new BusinessException(ErrorCode.GROUP_NOT_FOUND));
        group.updateAdminStatus(status);
        publish("GROUP", "STATUS_UPDATED", groupId);
        return groupMap(group);
    }

    @Transactional
    public Map<String, Object> cancelSession(Long actorId, Long sessionId) {
        admin(actorId);
        GroupSession session = sessions.findById(sessionId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        if (session.getStatus() == GroupSessionStatus.CLOSED) throw new BusinessException(ErrorCode.CONFLICT);
        session.cancel();
        publish("SESSION", "CANCELLED", sessionId);
        return sessionMap(session);
    }

    @Transactional
    public Map<String, Object> invalidateMatch(Long actorId, Long matchId, String reason) {
        admin(actorId);
        if (reason == null || reason.isBlank() || reason.length() > 500) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        MatchRecord match = matches.findById(matchId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        match.invalidate(reason.trim());
        publish("MATCH", "INVALIDATED", matchId);
        return matchMap(match);
    }

    @Transactional
    public Map<String, Object> updateInquiry(Long actorId, Long inquiryId, InquiryStatus status, String memo) {
        admin(actorId);
        Inquiry inquiry = inquiries.findById(inquiryId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        inquiry.updateStatus(status);
        inquiry.updateAdminMemo(memo);
        publish("INQUIRY", "UPDATED", inquiryId);
        return inquiryMap(inquiry);
    }

    @Transactional
    public void sendTestNotification(Long actorId) {
        User actor = admin(actorId);
        notificationService.send(actor, NotificationType.SYSTEM, "관리자 테스트 알림", "관리자 테스트 알림이 생성되었습니다.", "/admin/notifications");
        publish("NOTIFICATION", "TEST_SENT", actorId);
    }

    private Map<String, Object> home() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        List<User> recentUsers = users.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        List<Group> recentGroups = groups.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        List<GroupSession> todaySessions = sessions.findAllByStartsAtBetweenAndIsDeletedFalse(start, end);
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("전체 회원", users.count());
        stats.put("활성 회원", users.countByStatus(UserStatus.ACTIVE));
        stats.put("탈퇴 회원", users.countByStatus(UserStatus.DELETED));
        stats.put("오늘 가입", users.countByCreatedAtBetween(start, end));
        stats.put("전체 모임", groups.count());
        stats.put("활성 모임", groups.countByStatus(GroupStatus.ACTIVE));
        stats.put("오늘 일정", todaySessions.size());
        stats.put("진행 중 일정", todaySessions.stream().filter(item -> item.getStatus().name().equals("IN_PROGRESS")).count());
        stats.put("미처리 문의", inquiries.countByStatusNot(InquiryStatus.RESOLVED));
        return Map.of(
                "section", "home", "stats", stats,
                "items", recentUsers.stream().map(this::userMap).toList(),
                "secondaryItems", recentGroups.stream().map(this::groupMap).toList(),
                "page", 0, "size", 5, "totalElements", recentUsers.size(), "totalPages", 1
        );
    }

    private Map<String, Object> userPage(String keyword, UserRole role, UserStatus status, int page, int size) {
        List<User> filtered = users.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .filter(user -> role == null || user.getRole() == role)
                .filter(user -> status == null || user.getStatus() == status)
                .filter(user -> matches(keyword, user.getName(), user.getEmail()))
                .toList();
        return sliced("users", filtered.stream().map(this::userMap).toList(), page, size);
    }

    private Map<String, Object> groupPage(String keyword, int page, int size) {
        List<Map<String, Object>> data = groups.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .filter(group -> matches(keyword, group.getName(), group.getOwner().getName(), group.getOwner().getEmail()))
                .map(this::groupMap).toList();
        return sliced("groups", data, page, size);
    }

    private Map<String, Object> sessionPage(String keyword, int page, int size) {
        List<Map<String, Object>> data = sessions.findAll(Sort.by(Sort.Direction.DESC, "startsAt")).stream()
                .filter(item -> matches(keyword, item.getTitle(), item.getGroup().getName()))
                .map(this::sessionMap).toList();
        return sliced("sessions", data, page, size);
    }

    private Map<String, Object> notificationPage(String keyword, int page, int size) {
        List<Map<String, Object>> data = notifications.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .filter(item -> matches(keyword, item.getUser().getName(), item.getTitle(), item.getMessage(), item.getTargetPath()))
                .map(this::notificationMap)
                .toList();
        Map<String, Object> result = new LinkedHashMap<>(sliced("notifications", data, page, size));
        result.put("stats", Map.of(
                "전체 알림", notifications.count(),
                "읽지 않은 알림", notifications.countByReadFalse(),
                "푸시 구독", pushSubscriptions.count()
        ));
        return result;
    }

    private Map<String, Object> matchPage(int page, int size) {
        return paged("matches", matches.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "playedAt"))).map(this::matchMap));
    }

    private Map<String, Object> recordPage(int page, int size) {
        return paged("records", mmrHistories.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "changedAt"))).map(this::mmrMap));
    }

    private Map<String, Object> logPage(int page, int size) {
        return paged("logs", operationLogs.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))).map(this::logMap));
    }

    private Map<String, Object> inquiryPage(String keyword, InquiryStatus status, InquiryCategory category, int page, int size) {
        List<Map<String, Object>> data = inquiries.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .filter(item -> status == null || item.getStatus() == status)
                .filter(item -> category == null || item.getCategory() == category)
                .filter(item -> matches(keyword, item.getName(), item.getEmail(), item.getSubject(), item.getMessage()))
                .map(this::inquiryMap).toList();
        return sliced("inquiries", data, page, size);
    }

    private Map<String, Object> system(String section) {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("백엔드 API", "응답 정상");
        stats.put("실행 프로필", String.join(", ", environment.getActiveProfiles().length == 0 ? environment.getDefaultProfiles() : environment.getActiveProfiles()));
        stats.put("데이터베이스", "조회 정상");
        stats.put("WebSocket", "엔드포인트 활성");
        stats.put("SMTP 설정", configured("spring.mail.host"));
        stats.put("PWA 푸시 설정", configured("web-push.public-key"));
        stats.put("OAuth 설정", configured("spring.security.oauth2.client.registration.google.client-id"));
        stats.put("비밀값 노출", "보호됨");
        return Map.of("section", section, "stats", stats, "items", List.of(), "page", 0, "size", 10, "totalElements", 0, "totalPages", 1);
    }

    private Map<String, Object> emptySection(String section, int page, int size) {
        return Map.of("section", section, "stats", Map.of("점검 상태", "확인 대기", "등록 항목", 0), "items", List.of(), "page", page, "size", size, "totalElements", 0, "totalPages", 1);
    }

    private User admin(Long actorId) {
        User actor = users.findById(actorId).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (actor.getRole() != UserRole.ADMIN) throw new BusinessException(ErrorCode.FORBIDDEN);
        return actor;
    }

    private User user(Long userId) {
        return users.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private void protectLastAdmin(User target, boolean removingAdmin) {
        if (removingAdmin && target.getRole() == UserRole.ADMIN && target.getStatus() == UserStatus.ACTIVE && users.countByRoleAndStatus(UserRole.ADMIN, UserStatus.ACTIVE) <= 1) {
            throw new BusinessException(ErrorCode.CONFLICT);
        }
    }

    private void publishUser(String type, Long userId) {
        publish("USER", type, userId);
    }

    private void publish(String domain, String type, Long id) { messagingTemplate.convertAndSend("/topic/admin", Map.of("domain", domain, "type", type, "id", id)); }

    private boolean matches(String keyword, String... values) {
        if (keyword == null || keyword.isBlank()) return true;
        String normalized = keyword.trim().toLowerCase();
        for (String value : values) if (value != null && value.toLowerCase().contains(normalized)) return true;
        return false;
    }

    private boolean configured(String key) { return environment.getProperty(key) != null; }

    private Map<String, Object> sliced(String section, List<Map<String, Object>> data, int page, int size) {
        int from = Math.min(page * size, data.size());
        int to = Math.min(from + size, data.size());
        int pages = Math.max(1, (int) Math.ceil(data.size() / (double) size));
        return Map.of("section", section, "items", data.subList(from, to), "page", page, "size", size, "totalElements", data.size(), "totalPages", pages);
    }

    private Map<String, Object> paged(String section, Page<Map<String, Object>> result) {
        return Map.of("section", section, "items", result.getContent(), "page", result.getNumber(), "size", result.getSize(), "totalElements", result.getTotalElements(), "totalPages", Math.max(1, result.getTotalPages()));
    }

    private Map<String, Object> userMap(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId()); map.put("이름", user.getName()); map.put("이메일", user.getEmail());
        map.put("가입 방식", user.getProvider()); map.put("권한", user.getRole()); map.put("상태", user.getStatus());
        map.put("급수", user.getGrade()); map.put("복식 MMR", user.getDoublesMmr()); map.put("혼복 MMR", user.getMixedMmr()); map.put("가입일", user.getCreatedAt());
        return map;
    }

    private Map<String, Object> userDetailMap(User user) {
        Map<String, Object> map = userMap(user);
        map.put("성별", user.getGender()); map.put("나이대", user.getAgeGroup()); map.put("프로필 완성", user.isProfileCompleted());
        map.put("프로필 이미지", user.getProfileImageUrl()); map.put("최근 수정일", user.getUpdatedAt());
        return map;
    }

    private Map<String, Object> groupMap(Group group) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", group.getId()); map.put("모임명", group.getName()); map.put("운영자", group.getOwner().getName());
        map.put("활동 장소", group.getActivityRegion()); map.put("상태", group.getStatus()); map.put("생성일", group.getCreatedAt());
        return map;
    }

    private Map<String, Object> sessionMap(GroupSession item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId()); map.put("모임 ID", item.getGroup().getId()); map.put("일정명", item.getTitle()); map.put("모임명", item.getGroup().getName());
        map.put("운동 날짜", item.getStartsAt()); map.put("장소", item.getPlace()); map.put("코트 수", item.getCourtCount()); map.put("상태", item.getStatus()); map.put("참가자 수", item.getAttendanceCount());
        return map;
    }

    private Map<String, Object> inquiryMap(Inquiry item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId()); map.put("작성자", item.getName()); map.put("이메일", item.getEmail()); map.put("유형", item.getCategory()); map.put("제목", item.getSubject()); map.put("내용", item.getMessage()); map.put("상태", item.getStatus()); map.put("관리자 메모", item.getAdminMemo()); map.put("처리일", item.getProcessedAt()); map.put("생성일", item.getCreatedAt());
        return map;
    }

    private Map<String, Object> notificationMap(Notification item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId()); map.put("수신자", item.getUser().getName()); map.put("유형", item.getType()); map.put("제목", item.getTitle()); map.put("내용", item.getMessage()); map.put("이동 경로", item.getTargetPath()); map.put("읽음", item.isRead()); map.put("생성일", item.getCreatedAt());
        return map;
    }

    private Map<String, Object> matchMap(MatchRecord item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId()); map.put("모임 ID", item.getSession().getGroup().getId()); map.put("일정 ID", item.getSession().getId()); map.put("일정명", item.getSession().getTitle()); map.put("모임명", item.getSession().getGroup().getName());
        map.put("경기 유형", item.getMatchType()); map.put("A팀 점수", item.getTeamAScore()); map.put("B팀 점수", item.getTeamBScore()); map.put("경기 일시", item.getPlayedAt()); map.put("결과 입력", item.getResultConfirmedAt()); map.put("무효", item.isInvalidated()); map.put("무효 사유", item.getInvalidationReason());
        return map;
    }

    private Map<String, Object> mmrMap(MmrHistory item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId()); map.put("회원", item.getUser().getName()); map.put("이메일", item.getUser().getEmail()); map.put("경기 ID", item.getMatch() == null ? null : item.getMatch().getId());
        map.put("MMR 유형", item.getMmrType()); map.put("변경 전", item.getBeforeMmr()); map.put("변경 후", item.getAfterMmr()); map.put("변화량", item.getAfterMmr() - item.getBeforeMmr()); map.put("반영 일시", item.getChangedAt());
        return map;
    }

    private Map<String, Object> logMap(GroupOperationLog item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId()); map.put("관리자", item.getActor().getUser().getName()); map.put("모임", item.getGroup().getName()); map.put("작업 유형", item.getAction()); map.put("작업 내용", item.getDetail()); map.put("작업 시각", item.getCreatedAt());
        return map;
    }

}
