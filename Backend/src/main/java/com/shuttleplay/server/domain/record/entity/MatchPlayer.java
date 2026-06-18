package com.shuttleplay.server.domain.record.entity;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "match_players", uniqueConstraints = @UniqueConstraint(
        name = "uk_match_players_match_user", columnNames = {"match_id", "user_id"}), indexes = {
        @Index(name = "idx_match_players_user_match", columnList = "user_id,match_id")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MatchPlayer extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "match_id", nullable = false) private MatchRecord match;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "team_number", nullable = false) private int teamNumber;

    public static MatchPlayer create(MatchRecord match, User user, int teamNumber) {
        if (teamNumber != 1 && teamNumber != 2) throw new IllegalArgumentException("teamNumber must be 1 or 2");
        MatchPlayer player = new MatchPlayer();
        player.match = match;
        player.user = user;
        player.teamNumber = teamNumber;
        return player;
    }
}
