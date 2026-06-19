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
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
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

    @Column(name = "disabled_courts", length = 200)
    private String disabledCourtsCsv;

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

    @Column(name = "match_assignment_started", nullable = false)
    private boolean matchAssignmentStarted;

    @Column(name = "auto_court_assignment_enabled", nullable = false)
    private boolean autoCourtAssignmentEnabled;

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
        session.matchAssignmentStarted = false;
        session.autoCourtAssignmentEnabled = false;
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

    public void startOperation() { this.status = GroupSessionStatus.IN_PROGRESS; }
    public void startMatchAssignment() { this.matchAssignmentStarted = true; this.autoCourtAssignmentEnabled = true; }
    public void setAutoCourtAssignmentEnabled(boolean enabled) { this.autoCourtAssignmentEnabled = enabled; }
    public void resetMatchAssignment() { this.matchAssignmentStarted = false; this.autoCourtAssignmentEnabled = false; }
    public void closeOperation() { this.status = GroupSessionStatus.CLOSED; }

    public Set<Integer> disabledCourtNumbers() {
        if (disabledCourtsCsv == null || disabledCourtsCsv.isBlank()) return Set.of();
        return java.util.Arrays.stream(disabledCourtsCsv.split(",")).map(Integer::valueOf).collect(Collectors.toCollection(TreeSet::new));
    }

    public void updateDisabledCourts(Set<Integer> courts) {
        if (courts.stream().anyMatch(court -> court < 1 || court > courtCount)) throw new IllegalArgumentException("invalid court");
        disabledCourtsCsv = courts.stream().sorted().map(String::valueOf).collect(Collectors.joining(","));
    }

    public void updateCourtCount(int courtCount) {
        if (courtCount < 1) throw new IllegalArgumentException("invalid court count");
        this.courtCount = courtCount;
        updateDisabledCourts(disabledCourtNumbers().stream().filter(court -> court <= courtCount).collect(Collectors.toSet()));
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
