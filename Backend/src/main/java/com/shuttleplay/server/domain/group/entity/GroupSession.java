package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.domain.group.enums.GroupSessionStatus;
import com.shuttleplay.server.domain.group.enums.GroupSessionType;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "sessions",
        indexes = {
                @Index(name = "idx_sessions_group_starts_at", columnList = "group_id,starts_at"),
                @Index(name = "idx_sessions_status", columnList = "status")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupSession extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt;

    @Column
    private LocalDateTime endsAt;

    @Column(length = 200)
    private String place;

    @Column
    private LocalDateTime voteDeadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GroupSessionType sessionType = GroupSessionType.REGULAR;

    @Column(nullable = false)
    private int courtCount = 1;

    @Column(nullable = false)
    private boolean votingAllowed = true;

    @Column(nullable = false)
    private boolean guestLinkAllowed;

    @Column(nullable = false)
    private boolean guestAllowed = true;

    @Column(nullable = false)
    private int attendanceCount;

    @Column(name = "entry_code", unique = true, length = 8)
    private String entryCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GroupSessionStatus status;

    public static GroupSession create(
            Group group,
            String title,
            LocalDateTime startsAt,
            LocalDateTime endsAt,
            String place,
            LocalDateTime voteDeadline,
            GroupSessionType sessionType,
            int courtCount,
            boolean votingAllowed,
            boolean guestLinkAllowed,
            boolean guestAllowed
    ) {
        GroupSession session = new GroupSession();
        session.group = group;
        session.title = title;
        session.startsAt = startsAt;
        session.endsAt = endsAt;
        session.place = place;
        session.voteDeadline = voteDeadline;
        session.sessionType = sessionType;
        session.courtCount = courtCount;
        session.votingAllowed = votingAllowed;
        session.guestLinkAllowed = guestLinkAllowed;
        session.guestAllowed = guestAllowed;
        session.attendanceCount = 0;
        session.status = votingAllowed ? GroupSessionStatus.ATTENDANCE_OPEN : GroupSessionStatus.CREATED;
        return session;
    }

    public void update(String title, LocalDateTime startsAt, LocalDateTime endsAt, String place, LocalDateTime voteDeadline) {
        this.title = title;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.place = place;
        this.voteDeadline = voteDeadline;
    }

    public void cancel() {
        this.status = GroupSessionStatus.CANCELLED;
    }

    public void deleteSession() {
        softDelete();
    }

    public void updateAttendanceCount(int attendanceCount) {
        this.attendanceCount = attendanceCount;
    }

    public void assignEntryCode(String entryCode) {
        if (this.entryCode == null || this.entryCode.isBlank()) this.entryCode = entryCode;
    }
}
