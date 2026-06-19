package com.shuttleplay.server.domain.record.entity;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.group.entity.GroupSessionAttendance;
import com.shuttleplay.server.global.entity.BaseEntity;
import com.shuttleplay.server.domain.record.enums.MmrType;
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
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "attendance_id") private GroupSessionAttendance attendance;
    @Column(name = "display_name_snapshot", length = 50) private String displayNameSnapshot;
    @Column(name = "team_number", nullable = false) private int teamNumber;
    @Column(name = "mmr_before") private Integer mmrBefore;
    @Column(name = "mmr_after") private Integer mmrAfter;
    @Column(name = "mmr_delta") private Integer mmrDelta;
    @Enumerated(EnumType.STRING) @Column(name = "used_mmr_type", length = 20) private MmrType usedMmrType;

    public static MatchPlayer create(MatchRecord match, User user, int teamNumber) {
        if (teamNumber != 1 && teamNumber != 2) throw new IllegalArgumentException("teamNumber must be 1 or 2");
        MatchPlayer player = new MatchPlayer();
        player.match = match;
        player.user = user;
        player.teamNumber = teamNumber;
        player.displayNameSnapshot = user.getName();
        return player;
    }

    public static MatchPlayer create(MatchRecord match, GroupSessionAttendance attendance, int teamNumber) {
        MatchPlayer player = new MatchPlayer();
        player.match = match;
        player.attendance = attendance;
        player.user = attendance.getMember() != null ? attendance.getMember().getUser() : attendance.getGuest().getUser();
        player.displayNameSnapshot = attendance.getMember() != null ? attendance.getMember().getUser().getName() : attendance.getGuest().getName();
        player.teamNumber = teamNumber;
        return player;
    }

    public void applyMmr(MmrType type, int before, int after) {
        this.usedMmrType = type;
        this.mmrBefore = before;
        this.mmrAfter = after;
        this.mmrDelta = after - before;
    }

    public void clearMmr() { this.usedMmrType = null; this.mmrBefore = null; this.mmrAfter = null; this.mmrDelta = null; }

    public String displayName() { return displayNameSnapshot != null ? displayNameSnapshot : user == null ? "게스트" : user.getName(); }
}
