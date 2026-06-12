package com.shuttleplay.server.domain.group.dto.response;

import com.shuttleplay.server.domain.group.entity.GroupMember;
import com.shuttleplay.server.domain.group.enums.GroupMemberRole;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
public class GroupListItemResponse {
    private final Long id;
    private final String name;
    private final String profileImageUrl;
    private final GroupMemberRole role;
    private final long activeMembers;
    private final LocalDateTime lastParticipationAt;
    private final LocalDateTime nextScheduleAt;
    private final String activityRegion;
    private final String description;

    @Builder
    private GroupListItemResponse(
            Long id,
            String name,
            String profileImageUrl,
            GroupMemberRole role,
            long activeMembers,
            LocalDateTime lastParticipationAt,
            LocalDateTime nextScheduleAt,
            String activityRegion,
            String description
    ) {
        this.id = id;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
        this.role = role;
        this.activeMembers = activeMembers;
        this.lastParticipationAt = lastParticipationAt;
        this.nextScheduleAt = nextScheduleAt;
        this.activityRegion = activityRegion;
        this.description = description;
    }

    public static GroupListItemResponse from(
            GroupMember member,
            long activeMembers,
            LocalDateTime nextScheduleAt
    ) {
        return GroupListItemResponse.builder()
                .id(member.getGroup().getId())
                .name(member.getGroup().getName())
                .profileImageUrl(member.getGroup().getProfileImageUrl())
                .role(member.getRole())
                .activeMembers(activeMembers)
                .lastParticipationAt(member.getLastParticipationAt())
                .nextScheduleAt(nextScheduleAt)
                .activityRegion(member.getGroup().getActivityRegion())
                .description(member.getGroup().getDescription())
                .build();
    }
}
