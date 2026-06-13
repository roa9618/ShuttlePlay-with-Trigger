package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name = "group_operation_logs")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupOperationLog extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private Group group;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private GroupMember actor;
    @Column(nullable = false, length = 100) private String action;
    @Column(nullable = false, length = 1000) private String detail;
    public static GroupOperationLog create(Group group, GroupMember actor, String action, String detail) {
        GroupOperationLog log = new GroupOperationLog(); log.group = group; log.actor = actor; log.action = action; log.detail = detail; return log;
    }
}
