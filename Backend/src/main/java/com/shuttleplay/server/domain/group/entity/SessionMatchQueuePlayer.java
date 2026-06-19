package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "session_match_queue_players", uniqueConstraints = {
        @UniqueConstraint(name = "uk_session_queue_player", columnNames = {"queue_id", "attendance_id"})
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionMatchQueuePlayer extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "queue_id", nullable = false) private SessionMatchQueue queue;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "attendance_id", nullable = false) private GroupSessionAttendance attendance;
    @Column(name = "team_number", nullable = false) private int teamNumber;
    @Column(name = "position_order", nullable = false) private int positionOrder;

    static SessionMatchQueuePlayer create(SessionMatchQueue queue, GroupSessionAttendance attendance, int teamNumber, int positionOrder) {
        SessionMatchQueuePlayer player = new SessionMatchQueuePlayer();
        player.queue = queue;
        player.attendance = attendance;
        player.teamNumber = teamNumber;
        player.positionOrder = positionOrder;
        return player;
    }
}
