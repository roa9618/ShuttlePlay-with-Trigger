package com.shuttleplay.server.domain.record.entity;

import com.shuttleplay.server.domain.group.entity.GroupSession;
import com.shuttleplay.server.domain.group.entity.SessionMatchQueue;
import com.shuttleplay.server.domain.record.enums.MatchType;
import com.shuttleplay.server.domain.record.enums.MatchOperationStatus;
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
@Table(name = "matches", indexes = {
        @Index(name = "idx_matches_session_played_at", columnList = "session_id,played_at")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MatchRecord extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "session_id", nullable = false) private GroupSession session;
    @Enumerated(EnumType.STRING) @Column(name = "match_type", nullable = false, length = 30) private MatchType matchType;
    @Enumerated(EnumType.STRING) @Column(name = "play_style", nullable = false, length = 20) private PlayStyle playStyle;
    @Column(name = "played_at", nullable = false) private LocalDateTime playedAt;
    @Column(name = "ended_at") private LocalDateTime endedAt;
    @Column(name = "team_a_score", nullable = false) private int teamAScore;
    @Column(name = "team_b_score", nullable = false) private int teamBScore;
    @Column(name = "result_confirmed_at", nullable = false) private LocalDateTime resultConfirmedAt;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "match_queue_id") private SessionMatchQueue matchQueue;
    @Column(name = "court_number") private Integer courtNumber;
    @Enumerated(EnumType.STRING) @Column(name = "operation_status", length = 20) private MatchOperationStatus operationStatus;
    @Column(name = "called_at") private LocalDateTime calledAt;
    @Column(name = "started_at") private LocalDateTime startedAt;
    @Column(name = "result_updated", nullable = false) private boolean resultUpdated;
    @Column(name = "score_entered", nullable = false) private boolean scoreEntered;
    @Column(name = "result_update_reason", length = 500) private String resultUpdateReason;
    @Column(nullable = false) private boolean invalidated;
    @Column(name = "invalidation_reason", length = 500) private String invalidationReason;
    @Column(name = "invalidated_at") private LocalDateTime invalidatedAt;
    @OneToMany(mappedBy = "match", fetch = FetchType.LAZY) private List<MatchPlayer> players = new ArrayList<>();

    public static MatchRecord create(GroupSession session, MatchType matchType, PlayStyle playStyle,
                                     LocalDateTime playedAt, LocalDateTime endedAt,
                                     int teamAScore, int teamBScore) {
        MatchRecord match = new MatchRecord();
        match.session = session;
        match.matchType = matchType;
        match.playStyle = playStyle;
        match.playedAt = playedAt;
        match.startedAt = playedAt;
        match.endedAt = endedAt;
        match.teamAScore = teamAScore;
        match.teamBScore = teamBScore;
        match.resultConfirmedAt = LocalDateTime.now();
        match.invalidated = false;
        match.operationStatus = MatchOperationStatus.RESULT_ENTERED;
        match.resultUpdated = false;
        match.scoreEntered = true;
        return match;
    }

    public static MatchRecord createOperational(GroupSession session, SessionMatchQueue queue, int courtNumber) {
        MatchRecord match = new MatchRecord();
        match.session = session;
        match.matchQueue = queue;
        match.matchType = queue.getMatchType();
        match.playStyle = queue.getPlayStyle();
        match.courtNumber = courtNumber;
        match.playedAt = LocalDateTime.now();
        match.teamAScore = 0;
        match.teamBScore = 0;
        match.resultConfirmedAt = LocalDateTime.now();
        match.calledAt = LocalDateTime.now();
        match.operationStatus = MatchOperationStatus.CALLING;
        match.invalidated = false;
        match.resultUpdated = false;
        match.scoreEntered = false;
        return match;
    }

    public void invalidate(String reason) {
        this.invalidated = true;
        this.invalidationReason = reason;
        this.invalidatedAt = LocalDateTime.now();
    }

    public void confirmResult(int teamAScore, int teamBScore) {
        confirmResult(teamAScore, teamBScore, true);
    }

    public void confirmResult(int teamAScore, int teamBScore, boolean scoreEntered) {
        if (teamAScore < 0 || teamBScore < 0) throw new IllegalArgumentException("score must be zero or positive");
        this.teamAScore = teamAScore;
        this.teamBScore = teamBScore;
        this.endedAt = LocalDateTime.now();
        if (this.startedAt == null) this.startedAt = this.calledAt == null ? this.endedAt : this.calledAt;
        this.resultConfirmedAt = LocalDateTime.now();
        this.invalidated = false;
        this.invalidationReason = null;
        this.invalidatedAt = null;
        this.operationStatus = MatchOperationStatus.RESULT_ENTERED;
        this.scoreEntered = scoreEntered;
    }

    public void start() { this.operationStatus = MatchOperationStatus.PLAYING; if (startedAt == null) startedAt = LocalDateTime.now(); }

    public void cancelOperation(String reason) {
        this.operationStatus = MatchOperationStatus.CANCELED;
        this.endedAt = LocalDateTime.now();
        this.invalidationReason = reason;
    }

    public void updateResult(int teamAScore, int teamBScore, boolean scoreEntered, String reason) {
        confirmResult(teamAScore, teamBScore, scoreEntered);
        this.resultUpdated = true;
        this.resultUpdateReason = reason;
    }
}
