package com.shuttleplay.server.domain.record.entity;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "daily_records", uniqueConstraints = @UniqueConstraint(
        name = "uk_daily_records_user_date", columnNames = {"user_id", "record_date"}), indexes = {
        @Index(name = "idx_daily_records_user_date", columnList = "user_id,record_date")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DailyRecord extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "record_date", nullable = false) private LocalDate recordDate;
    @Column(nullable = false) private int games;
    @Column(nullable = false) private int wins;
    @Column(nullable = false) private int losses;
    @Column(name = "points_for", nullable = false) private int pointsFor;
    @Column(name = "points_against", nullable = false) private int pointsAgainst;
    @Column(name = "doubles_mmr_delta", nullable = false) private int doublesMmrDelta;
    @Column(name = "mixed_mmr_delta", nullable = false) private int mixedMmrDelta;

    public static DailyRecord create(User user, LocalDate date) { DailyRecord record = new DailyRecord(); record.user = user; record.recordDate = date; return record; }
    public void update(int games, int wins, int pointsFor, int pointsAgainst, int doublesDelta, int mixedDelta) {
        this.games = games; this.wins = wins; this.losses = games - wins; this.pointsFor = pointsFor;
        this.pointsAgainst = pointsAgainst; this.doublesMmrDelta = doublesDelta; this.mixedMmrDelta = mixedDelta;
    }
}
