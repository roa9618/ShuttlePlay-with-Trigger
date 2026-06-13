package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.domain.group.enums.JoinRequestStatus;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name = "group_join_requests")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupJoinRequest extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private Group group;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private User requester;
    @Column(length = 1000) private String message;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private JoinRequestStatus status;
    public void approve() { status = JoinRequestStatus.APPROVED; }
    public void reject() { status = JoinRequestStatus.REJECTED; }
}
