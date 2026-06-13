package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.domain.group.enums.GroupMemberRole;
import com.shuttleplay.server.domain.group.enums.GroupMemberStatus;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "group_members",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_group_members_group_user",
                        columnNames = {"group_id", "user_id"}
                )
        },
        indexes = {
                @Index(name = "idx_group_members_user_status", columnList = "user_id,status"),
                @Index(name = "idx_group_members_group_status", columnList = "group_id,status")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupMember extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GroupMemberRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GroupMemberStatus status;

    @Column(nullable = false)
    private int participationCount;

    @Column
    private LocalDateTime lastParticipationAt;

    @Column
    private LocalDateTime lastAccessedAt;

    @Column(nullable = false)
    private int monthlyParticipationRate;

    @Column(nullable = false)
    private int recentFourWeekParticipationCount;

    @Column(nullable = false)
    private int averageParticipationIntervalDays;

    @Column(length = 1000)
    private String memo;

    @Column(nullable = false)
    private boolean schedulePermission;

    @Column(nullable = false)
    private boolean noticePermission;

    @Column(nullable = false)
    private boolean joinRequestPermission;

    @Column(nullable = false)
    private boolean memberPermission;

    @Column(nullable = false)
    private boolean postPermission;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean operationLogPermission;

    @Builder
    private GroupMember(Group group, User user, GroupMemberRole role, GroupMemberStatus status,
                        int participationCount, LocalDateTime lastParticipationAt,
                        LocalDateTime lastAccessedAt, int monthlyParticipationRate,
                        int recentFourWeekParticipationCount, int averageParticipationIntervalDays) {
        this.group = group;
        this.user = user;
        this.role = role;
        this.status = status;
        this.participationCount = participationCount;
        this.lastParticipationAt = lastParticipationAt;
        this.lastAccessedAt = lastAccessedAt;
        this.monthlyParticipationRate = monthlyParticipationRate;
        this.recentFourWeekParticipationCount = recentFourWeekParticipationCount;
        this.averageParticipationIntervalDays = averageParticipationIntervalDays;
    }

    public static GroupMember createOwner(Group group, User user) {
        return GroupMember.builder()
                .group(group)
                .user(user)
                .role(GroupMemberRole.OWNER)
                .status(GroupMemberStatus.ACTIVE)
                .participationCount(0)
                .lastAccessedAt(LocalDateTime.now())
                .monthlyParticipationRate(0)
                .recentFourWeekParticipationCount(0)
                .averageParticipationIntervalDays(0)
                .build();
    }

    public static GroupMember createMember(Group group, User user) {
        return GroupMember.builder()
                .group(group).user(user).role(GroupMemberRole.MEMBER).status(GroupMemberStatus.ACTIVE)
                .participationCount(0).lastAccessedAt(LocalDateTime.now()).monthlyParticipationRate(0)
                .recentFourWeekParticipationCount(0).averageParticipationIntervalDays(0).build();
    }

    public void updateRole(GroupMemberRole role) {
        this.role = role;
    }

    public void updatePermissions(boolean schedule, boolean notice, boolean joinRequest, boolean member, boolean post,
                                  boolean operationLog) {
        this.schedulePermission = schedule;
        this.noticePermission = notice;
        this.joinRequestPermission = joinRequest;
        this.memberPermission = member;
        this.postPermission = post;
        this.operationLogPermission = operationLog;
    }

    public void updateMemo(String memo) {
        this.memo = memo;
    }

    public void leave() {
        this.status = GroupMemberStatus.INACTIVE;
        softDelete();
    }

    public void reactivate() {
        this.status = GroupMemberStatus.ACTIVE;
        this.role = GroupMemberRole.MEMBER;
        this.lastAccessedAt = LocalDateTime.now();
        restore();
    }
}
