package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.domain.group.enums.SessionQueueStatus;
import com.shuttleplay.server.domain.record.enums.MatchType;
import com.shuttleplay.server.domain.record.enums.PlayStyle;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "session_match_queues", indexes = {
        @Index(name = "idx_session_match_queues_order", columnList = "session_id,status,queue_order")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionMatchQueue extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "session_id", nullable = false) private GroupSession session;
    @Column(name = "queue_order", nullable = false) private int queueOrder;
    @Enumerated(EnumType.STRING) @Column(name = "match_type", nullable = false, length = 30) private MatchType matchType;
    @Enumerated(EnumType.STRING) @Column(name = "play_style", nullable = false, length = 20) private PlayStyle playStyle;
    @Column(nullable = false) private double score;
    @Column(length = 1000) private String explanation;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private SessionQueueStatus status;
    @Column(name = "assigned_court_number") private Integer assignedCourtNumber;
    @Column(name = "called_at") private LocalDateTime calledAt;
    @OneToMany(mappedBy = "queue", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("teamNumber asc, positionOrder asc")
    private List<SessionMatchQueuePlayer> players = new ArrayList<>();

    public static SessionMatchQueue create(GroupSession session, int queueOrder, MatchType matchType,
                                           PlayStyle playStyle, double score, List<String> explanations) {
        SessionMatchQueue queue = new SessionMatchQueue();
        queue.session = session;
        queue.queueOrder = queueOrder;
        queue.matchType = matchType;
        queue.playStyle = playStyle;
        queue.score = score;
        queue.explanation = String.join("\n", explanations);
        queue.status = SessionQueueStatus.WAITING;
        return queue;
    }

    public void addPlayer(GroupSessionAttendance attendance, int teamNumber, int positionOrder) {
        players.add(SessionMatchQueuePlayer.create(this, attendance, teamNumber, positionOrder));
    }

    public void replacePlayers(List<GroupSessionAttendance> teamA, List<GroupSessionAttendance> teamB) {
        players.clear();
        for (int index = 0; index < teamA.size(); index++) addPlayer(teamA.get(index), 1, index + 1);
        for (int index = 0; index < teamB.size(); index++) addPlayer(teamB.get(index), 2, index + 1);
        explanation = "운영자가 참가자 구성을 직접 조정했어요.";
    }

    public void call(int courtNumber) {
        status = SessionQueueStatus.CALLING;
        assignedCourtNumber = courtNumber;
        calledAt = LocalDateTime.now();
    }

    public void start() { status = SessionQueueStatus.STARTED; }
    public void cancel() { status = SessionQueueStatus.CANCELED; }
    public void reorder(int order) { queueOrder = order; }
}
