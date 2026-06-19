package com.shuttleplay.server.domain.record.entity;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "match_result_revisions", indexes = @Index(name = "idx_match_result_revisions_match", columnList = "match_id"))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MatchResultRevision extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "match_id", nullable = false) private MatchRecord match;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "modified_by", nullable = false) private User modifiedBy;
    @Column(name = "previous_team_a_score", nullable = false) private int previousTeamAScore;
    @Column(name = "previous_team_b_score", nullable = false) private int previousTeamBScore;
    @Column(name = "new_team_a_score", nullable = false) private int newTeamAScore;
    @Column(name = "new_team_b_score", nullable = false) private int newTeamBScore;
    @Column(name = "previous_score_entered") private boolean previousScoreEntered;
    @Column(name = "new_score_entered") private boolean newScoreEntered;
    @Column(nullable = false, length = 500) private String reason;

    public static MatchResultRevision create(MatchRecord match, User modifiedBy, int newTeamAScore, int newTeamBScore, boolean newScoreEntered, String reason) {
        MatchResultRevision revision = new MatchResultRevision();
        revision.match = match; revision.modifiedBy = modifiedBy;
        revision.previousTeamAScore = match.getTeamAScore(); revision.previousTeamBScore = match.getTeamBScore();
        revision.previousScoreEntered = match.isScoreEntered(); revision.newScoreEntered = newScoreEntered;
        revision.newTeamAScore = newTeamAScore; revision.newTeamBScore = newTeamBScore; revision.reason = reason;
        return revision;
    }
}
