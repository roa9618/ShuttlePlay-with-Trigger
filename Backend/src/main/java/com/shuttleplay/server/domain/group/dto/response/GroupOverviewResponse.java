package com.shuttleplay.server.domain.group.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
public class GroupOverviewResponse {
    private final HighlightGroup nearestSchedule;
    private final HighlightGroup frequentGroup;
    private final HighlightGroup recentAccessGroup;
    private final long totalGroupCount;
    private final long ownerGroupCount;
    private final long memberGroupCount;
    private final long totalActiveMemberCount;
    private final long weeklyScheduleCount;

    @Builder
    private GroupOverviewResponse(
            HighlightGroup nearestSchedule,
            HighlightGroup frequentGroup,
            HighlightGroup recentAccessGroup,
            long totalGroupCount,
            long ownerGroupCount,
            long memberGroupCount,
            long totalActiveMemberCount,
            long weeklyScheduleCount
    ) {
        this.nearestSchedule = nearestSchedule;
        this.frequentGroup = frequentGroup;
        this.recentAccessGroup = recentAccessGroup;
        this.totalGroupCount = totalGroupCount;
        this.ownerGroupCount = ownerGroupCount;
        this.memberGroupCount = memberGroupCount;
        this.totalActiveMemberCount = totalActiveMemberCount;
        this.weeklyScheduleCount = weeklyScheduleCount;
    }

    @Getter
    public static class HighlightGroup {
        private final Long groupId;
        private final String groupName;
        private final LocalDateTime scheduleAt;
        private final Integer participationCount;
        private final LocalDateTime accessedAt;

        @Builder
        private HighlightGroup(
                Long groupId,
                String groupName,
                LocalDateTime scheduleAt,
                Integer participationCount,
                LocalDateTime accessedAt
        ) {
            this.groupId = groupId;
            this.groupName = groupName;
            this.scheduleAt = scheduleAt;
            this.participationCount = participationCount;
            this.accessedAt = accessedAt;
        }
    }
}
