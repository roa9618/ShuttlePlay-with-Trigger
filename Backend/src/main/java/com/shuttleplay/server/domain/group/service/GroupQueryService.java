package com.shuttleplay.server.domain.group.service;

import com.shuttleplay.server.domain.group.dto.response.GroupActivitySummaryResponse;
import com.shuttleplay.server.domain.group.dto.response.GroupListItemResponse;
import com.shuttleplay.server.domain.group.dto.response.GroupListResponse;
import com.shuttleplay.server.domain.group.dto.response.GroupOverviewResponse;
import com.shuttleplay.server.domain.group.entity.GroupMember;
import com.shuttleplay.server.domain.group.entity.GroupSession;
import com.shuttleplay.server.domain.group.enums.GroupMemberRole;
import com.shuttleplay.server.domain.group.enums.GroupMemberStatus;
import com.shuttleplay.server.domain.group.enums.GroupSessionStatus;
import com.shuttleplay.server.domain.group.enums.SessionAttendanceStatus;
import com.shuttleplay.server.domain.group.repository.ActiveMemberCount;
import com.shuttleplay.server.domain.group.repository.GroupLastParticipation;
import com.shuttleplay.server.domain.group.repository.GroupMemberRepository;
import com.shuttleplay.server.domain.group.repository.GroupSessionAttendanceRepository;
import com.shuttleplay.server.domain.group.repository.GroupSessionRepository;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GroupQueryService {
    private static final int RECENT_ACTIVITY_DAYS = 28;

    private final GroupMemberRepository groupMemberRepository;
    private final GroupSessionRepository groupSessionRepository;
    private final GroupSessionAttendanceRepository attendanceRepository;

    public GroupOverviewResponse getOverview(Long userId) {
        List<GroupMember> memberships = groupMemberRepository.findAllByUserIdAndStatus(
                userId,
                GroupMemberStatus.ACTIVE
        );

        if (memberships.isEmpty()) {
            return emptyOverview();
        }

        List<Long> groupIds = getGroupIds(memberships);
        Map<Long, Long> activeMemberCounts = getActiveMemberCounts(groupIds);
        LocalDateTime now = LocalDateTime.now();
        List<GroupSession> weeklySessions = getWeeklySessions(groupIds, now);

        GroupMember frequentGroup = memberships.stream()
                .max(Comparator.comparingInt(GroupMember::getParticipationCount))
                .orElse(null);

        GroupMember recentAccessGroup = memberships.stream()
                .filter(member -> member.getLastAccessedAt() != null)
                .max(Comparator.comparing(GroupMember::getLastAccessedAt))
                .orElse(null);

        GroupSession nearestSchedule = nearestSchedule(weeklySessions, now).orElse(null);

        long ownerGroupCount = memberships.stream()
                .filter(member -> member.getRole() == GroupMemberRole.OWNER)
                .count();

        long totalActiveMemberCount = memberships.stream()
                .map(GroupMember::getGroup)
                .mapToLong(group -> activeMemberCounts.getOrDefault(group.getId(), 0L))
                .sum();

        return GroupOverviewResponse.builder()
                .nearestSchedule(toScheduleHighlight(nearestSchedule))
                .frequentGroup(toFrequentHighlight(frequentGroup))
                .recentAccessGroup(toRecentAccessHighlight(recentAccessGroup))
                .totalGroupCount(memberships.size())
                .ownerGroupCount(ownerGroupCount)
                .memberGroupCount(memberships.size() - ownerGroupCount)
                .totalActiveMemberCount(totalActiveMemberCount)
                .weeklyScheduleCount(weeklySessions.size())
                .build();
    }

    public GroupListResponse getMyGroups(
            Long userId,
            String keyword,
            GroupMemberRole role,
            int page,
            int size
    ) {
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.ASC, "group.name")
        );

        Page<GroupMember> memberships = groupMemberRepository.findMyGroups(
                userId,
                GroupMemberStatus.ACTIVE,
                role,
                keyword.trim(),
                pageRequest
        );

        List<Long> groupIds = getGroupIds(memberships.getContent());
        Map<Long, Long> activeMemberCounts = getActiveMemberCounts(groupIds);
        Map<Long, LocalDateTime> nextScheduleByGroupId = getNextScheduleByGroupId(groupIds);
        Map<Long, LocalDateTime> lastParticipationByGroupId = getLastParticipationByGroupId(userId, groupIds);

        List<GroupListItemResponse> items = memberships.getContent().stream()
                .map(member -> GroupListItemResponse.from(
                        member,
                        activeMemberCounts.getOrDefault(member.getGroup().getId(), 0L),
                        nextScheduleByGroupId.get(member.getGroup().getId()),
                        lastParticipationByGroupId.getOrDefault(member.getGroup().getId(), member.getLastParticipationAt())
                ))
                .toList();

        return GroupListResponse.builder()
                .items(items)
                .page(memberships.getNumber())
                .size(memberships.getSize())
                .totalElements(memberships.getTotalElements())
                .totalPages(memberships.getTotalPages())
                .build();
    }

    public GroupListResponse getManageableGroups(
            Long userId,
            boolean scheduleOnly,
            int page,
            int size
    ) {
        Page<GroupMember> memberships = groupMemberRepository.findManageableGroups(
                userId,
                GroupMemberStatus.ACTIVE,
                scheduleOnly,
                PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "group.name"))
        );

        List<Long> groupIds = getGroupIds(memberships.getContent());
        Map<Long, Long> activeMemberCounts = getActiveMemberCounts(groupIds);
        Map<Long, LocalDateTime> nextScheduleByGroupId = getNextScheduleByGroupId(groupIds);
        Map<Long, LocalDateTime> lastParticipationByGroupId = getLastParticipationByGroupId(userId, groupIds);
        List<GroupListItemResponse> items = memberships.getContent().stream()
                .map(member -> GroupListItemResponse.from(
                        member,
                        activeMemberCounts.getOrDefault(member.getGroup().getId(), 0L),
                        nextScheduleByGroupId.get(member.getGroup().getId()),
                        lastParticipationByGroupId.getOrDefault(member.getGroup().getId(), member.getLastParticipationAt())
                ))
                .toList();

        return GroupListResponse.builder()
                .items(items)
                .page(memberships.getNumber())
                .size(memberships.getSize())
                .totalElements(memberships.getTotalElements())
                .totalPages(memberships.getTotalPages())
                .build();
    }

    public GroupActivitySummaryResponse getActivitySummary(Long userId, Long groupId) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserIdAndStatus(
                        groupId,
                        userId,
                        GroupMemberStatus.ACTIVE
                )
                .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();
        List<GroupSession> recentSessions = groupSessionRepository
                .findAllByGroupIdAndStartsAtBetweenAndStatusNotAndIsDeletedFalse(
                        groupId,
                        now.minusDays(RECENT_ACTIVITY_DAYS),
                        now,
                        GroupSessionStatus.CANCELLED
                );

        int averageAttendance = recentSessions.isEmpty()
                ? 0
                : (int) Math.round(recentSessions.stream()
                .mapToInt(GroupSession::getAttendanceCount)
                .average()
                .orElse(0));

        return GroupActivitySummaryResponse.from(
                member,
                recentSessions.size(),
                averageAttendance,
                getPeakActivityTime(recentSessions)
        );
    }

    private GroupOverviewResponse emptyOverview() {
        return GroupOverviewResponse.builder()
                .totalGroupCount(0)
                .ownerGroupCount(0)
                .memberGroupCount(0)
                .totalActiveMemberCount(0)
                .weeklyScheduleCount(0)
                .build();
    }

    private List<Long> getGroupIds(List<GroupMember> memberships) {
        return memberships.stream()
                .map(member -> member.getGroup().getId())
                .toList();
    }

    private Map<Long, Long> getActiveMemberCounts(List<Long> groupIds) {
        if (groupIds.isEmpty()) {
            return Map.of();
        }

        return groupMemberRepository.countActiveMembersByGroupIds(
                        groupIds,
                        GroupMemberStatus.ACTIVE
                ).stream()
                .collect(Collectors.toMap(
                        ActiveMemberCount::getGroupId,
                        ActiveMemberCount::getMemberCount
                ));
    }

    private List<GroupSession> getWeeklySessions(List<Long> groupIds, LocalDateTime now) {
        LocalDateTime startOfWeek = now
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .with(LocalTime.MIN);
        LocalDateTime endOfWeek = now
                .with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
                .with(LocalTime.MAX);

        return groupSessionRepository.findAllByGroupIdInAndStartsAtBetweenAndStatusNotAndIsDeletedFalse(
                groupIds,
                startOfWeek,
                endOfWeek,
                GroupSessionStatus.CANCELLED
        );
    }

    private Map<Long, LocalDateTime> getNextScheduleByGroupId(List<Long> groupIds) {
        if (groupIds.isEmpty()) {
            return Map.of();
        }

        LocalDateTime now = LocalDateTime.now();

        return getWeeklySessions(groupIds, now).stream()
                .filter(session -> isOperableSchedule(session, now))
                .collect(Collectors.toMap(
                        session -> session.getGroup().getId(),
                        GroupSession::getStartsAt,
                        (first, second) -> betterScheduleAt(first, second, now)
                ));
    }

    private Map<Long, LocalDateTime> getLastParticipationByGroupId(Long userId, List<Long> groupIds) {
        if (groupIds.isEmpty()) {
            return Map.of();
        }
        return attendanceRepository.findLastParticipationsByUserAndGroups(
                        userId,
                        groupIds,
                        List.of(SessionAttendanceStatus.ARRIVED, SessionAttendanceStatus.LATE),
                        GroupSessionStatus.CLOSED
                ).stream()
                .collect(Collectors.toMap(
                        GroupLastParticipation::getGroupId,
                        GroupLastParticipation::getLastParticipationAt
                ));
    }

    private Optional<GroupSession> nearestSchedule(List<GroupSession> sessions, LocalDateTime now) {
        Optional<GroupSession> current = sessions.stream()
                .filter(session -> isCurrentSchedule(session, now))
                .max(Comparator.comparing(GroupSession::getStartsAt));
        if (current.isPresent()) {
            return current;
        }
        return sessions.stream()
                .filter(session -> isFutureSchedule(session, now))
                .min(Comparator.comparing(GroupSession::getStartsAt));
    }

    private boolean isOperableSchedule(GroupSession session, LocalDateTime now) {
        return isCurrentSchedule(session, now) || isFutureSchedule(session, now);
    }

    private boolean isCurrentSchedule(GroupSession session, LocalDateTime now) {
        return session.getStatus() != GroupSessionStatus.CANCELLED
                && session.getStatus() != GroupSessionStatus.CLOSED
                && !session.getStartsAt().isAfter(now)
                && (session.getEndsAt() == null || !session.getEndsAt().isBefore(now));
    }

    private boolean isFutureSchedule(GroupSession session, LocalDateTime now) {
        return session.getStatus() != GroupSessionStatus.CANCELLED
                && session.getStatus() != GroupSessionStatus.CLOSED
                && !session.getStartsAt().isBefore(now);
    }

    private LocalDateTime betterScheduleAt(LocalDateTime first, LocalDateTime second, LocalDateTime now) {
        boolean firstCurrent = !first.isAfter(now);
        boolean secondCurrent = !second.isAfter(now);
        if (firstCurrent && !secondCurrent) return first;
        if (!firstCurrent && secondCurrent) return second;
        if (firstCurrent) return first.isAfter(second) ? first : second;
        return first.isBefore(second) ? first : second;
    }

    private GroupOverviewResponse.HighlightGroup toScheduleHighlight(GroupSession session) {
        if (session == null) {
            return null;
        }

        return GroupOverviewResponse.HighlightGroup.builder()
                .groupId(session.getGroup().getId())
                .groupName(session.getGroup().getName())
                .scheduleAt(session.getStartsAt())
                .build();
    }

    private GroupOverviewResponse.HighlightGroup toFrequentHighlight(GroupMember member) {
        if (member == null) {
            return null;
        }

        return GroupOverviewResponse.HighlightGroup.builder()
                .groupId(member.getGroup().getId())
                .groupName(member.getGroup().getName())
                .participationCount(member.getParticipationCount())
                .build();
    }

    private GroupOverviewResponse.HighlightGroup toRecentAccessHighlight(GroupMember member) {
        if (member == null) {
            return null;
        }

        return GroupOverviewResponse.HighlightGroup.builder()
                .groupId(member.getGroup().getId())
                .groupName(member.getGroup().getName())
                .accessedAt(member.getLastAccessedAt())
                .build();
    }

    private String getPeakActivityTime(List<GroupSession> sessions) {
        if (sessions.isEmpty()) {
            return "기록 없음";
        }

        Map<ActivityTime, Long> counts = sessions.stream()
                .map(session -> new ActivityTime(
                        session.getStartsAt().getDayOfWeek(),
                        session.getStartsAt().getHour()
                ))
                .collect(Collectors.groupingBy(Function.identity(), HashMap::new, Collectors.counting()));

        ActivityTime peak = counts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElseThrow();

        return toKoreanDayOfWeek(peak.dayOfWeek()) + " " + peak.hour() + "시";
    }

    private String toKoreanDayOfWeek(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "월요일";
            case TUESDAY -> "화요일";
            case WEDNESDAY -> "수요일";
            case THURSDAY -> "목요일";
            case FRIDAY -> "금요일";
            case SATURDAY -> "토요일";
            case SUNDAY -> "일요일";
        };
    }

    private record ActivityTime(DayOfWeek dayOfWeek, int hour) {
    }
}
