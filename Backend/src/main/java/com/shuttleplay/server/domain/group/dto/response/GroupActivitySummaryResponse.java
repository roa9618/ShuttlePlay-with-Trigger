package com.shuttleplay.server.domain.group.dto.response;

import com.shuttleplay.server.domain.group.entity.GroupMember;
import com.shuttleplay.server.domain.group.enums.GroupMemberRole;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
public class GroupActivitySummaryResponse {
    private final Long groupId;
    private final String name;
    private final String profileImageUrl;
    private final GroupMemberRole role;
    private final String activityRegion;
    private final String organizerName;
    private final LocalDateTime createdAt;
    private final String operationNotice;
    private final int monthlyParticipationRate;
    private final int recentFourWeekParticipationCount;
    private final int averageParticipationIntervalDays;
    private final int recentFourWeekScheduleCount;
    private final int averageAttendance;
    private final String peakActivityTime;

    @Builder
    private GroupActivitySummaryResponse(
            Long groupId,
            String name,
            String profileImageUrl,
            GroupMemberRole role,
            String activityRegion,
            String organizerName,
            LocalDateTime createdAt,
            String operationNotice,
            int monthlyParticipationRate,
            int recentFourWeekParticipationCount,
            int averageParticipationIntervalDays,
            int recentFourWeekScheduleCount,
            int averageAttendance,
            String peakActivityTime
    ) {
        this.groupId = groupId;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
        this.role = role;
        this.activityRegion = activityRegion;
        this.organizerName = organizerName;
        this.createdAt = createdAt;
        this.operationNotice = operationNotice;
        this.monthlyParticipationRate = monthlyParticipationRate;
        this.recentFourWeekParticipationCount = recentFourWeekParticipationCount;
        this.averageParticipationIntervalDays = averageParticipationIntervalDays;
        this.recentFourWeekScheduleCount = recentFourWeekScheduleCount;
        this.averageAttendance = averageAttendance;
        this.peakActivityTime = peakActivityTime;
    }

    public static GroupActivitySummaryResponse from(
            GroupMember member,
            int recentFourWeekScheduleCount,
            int averageAttendance,
            String peakActivityTime
    ) {
        return GroupActivitySummaryResponse.builder()
                .groupId(member.getGroup().getId())
                .name(member.getGroup().getName())
                .profileImageUrl(member.getGroup().getProfileImageUrl())
                .role(member.getRole())
                .activityRegion(member.getGroup().getActivityRegion())
                .organizerName(member.getGroup().getOwner().getName())
                .createdAt(member.getGroup().getCreatedAt())
                .operationNotice(member.getGroup().getOperationNotice())
                .monthlyParticipationRate(member.getMonthlyParticipationRate())
                .recentFourWeekParticipationCount(member.getRecentFourWeekParticipationCount())
                .averageParticipationIntervalDays(member.getAverageParticipationIntervalDays())
                .recentFourWeekScheduleCount(recentFourWeekScheduleCount)
                .averageAttendance(averageAttendance)
                .peakActivityTime(peakActivityTime)
                .build();
    }
}
