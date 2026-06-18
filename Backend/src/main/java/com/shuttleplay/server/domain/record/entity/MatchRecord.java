package com.shuttleplay.server.domain.record.entity;

import com.shuttleplay.server.domain.group.entity.GroupSession;
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
        match.endedAt = endedAt;
        match.teamAScore = teamAScore;
        match.teamBScore = teamBScore;
        match.resultConfirmedAt = LocalDateTime.now();
        match.invalidated = false;
        return match;
    }

    public void invalidate(String reason) {
        this.invalidated = true;
        this.invalidationReason = reason;
        this.invalidatedAt = LocalDateTime.now();
    }
}
