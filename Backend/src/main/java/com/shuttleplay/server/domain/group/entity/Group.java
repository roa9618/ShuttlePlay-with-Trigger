package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.domain.group.enums.GroupStatus;
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
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "`groups`",
        indexes = {
                @Index(name = "idx_groups_owner_id", columnList = "owner_id"),
                @Index(name = "idx_groups_status", columnList = "status")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Group extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String profileImageUrl;

    @Column(nullable = false, length = 100)
    private String activityRegion;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(length = 1000)
    private String operationNotice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GroupStatus status;

    @Builder
    private Group(User owner, String name, String profileImageUrl, String activityRegion,
                  String description, String operationNotice, GroupStatus status) {
        this.owner = owner;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
        this.activityRegion = activityRegion;
        this.description = description;
        this.operationNotice = operationNotice;
        this.status = status;
    }

    public static Group create(User owner, String name, String profileImageUrl,
                               String activityRegion, String description, String operationNotice) {
        return Group.builder()
                .owner(owner)
                .name(name)
                .profileImageUrl(profileImageUrl)
                .activityRegion(activityRegion)
                .description(description)
                .operationNotice(operationNotice)
                .status(GroupStatus.ACTIVE)
                .build();
    }
}
