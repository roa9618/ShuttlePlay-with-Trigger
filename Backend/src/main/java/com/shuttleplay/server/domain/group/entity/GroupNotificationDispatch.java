package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name = "group_notification_dispatches", uniqueConstraints = @UniqueConstraint(columnNames = {"event_key", "user_id"}))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupNotificationDispatch extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "event_key", nullable = false, length = 100) private String eventKey;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private User user;
    public static GroupNotificationDispatch create(String eventKey, User user) {
        GroupNotificationDispatch dispatch = new GroupNotificationDispatch(); dispatch.eventKey = eventKey; dispatch.user = user; return dispatch;
    }
}
