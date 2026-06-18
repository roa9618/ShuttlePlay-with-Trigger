package com.shuttleplay.server.domain.record.entity;

import com.shuttleplay.server.domain.record.enums.MmrType;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "mmr_histories", indexes = {
        @Index(name = "idx_mmr_histories_user_type_changed", columnList = "user_id,mmr_type,changed_at")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MmrHistory extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "match_id") private MatchRecord match;
    @Enumerated(EnumType.STRING) @Column(name = "mmr_type", nullable = false, length = 20) private MmrType mmrType;
    @Column(name = "before_mmr", nullable = false) private int beforeMmr;
    @Column(name = "after_mmr", nullable = false) private int afterMmr;
    @Column(name = "changed_at", nullable = false) private LocalDateTime changedAt;

    public static MmrHistory create(User user, MatchRecord match, MmrType mmrType,
                                    int beforeMmr, int afterMmr, LocalDateTime changedAt) {
        MmrHistory history = new MmrHistory();
        history.user = user;
        history.match = match;
        history.mmrType = mmrType;
        history.beforeMmr = beforeMmr;
        history.afterMmr = afterMmr;
        history.changedAt = changedAt;
        return history;
    }
}
