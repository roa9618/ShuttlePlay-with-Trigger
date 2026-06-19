package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.domain.group.enums.SessionAttendanceStatus;
import com.shuttleplay.server.domain.group.enums.SessionPlayStatus;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "group_session_attendance_entries", uniqueConstraints = {
        @UniqueConstraint(name = "uk_session_attendance_member", columnNames = {"session_id", "member_id"}),
        @UniqueConstraint(name = "uk_session_attendance_guest", columnNames = {"session_id", "guest_id"})
}, indexes = {
        @Index(name = "idx_session_attendance_entry_session", columnList = "session_id"),
        @Index(name = "idx_session_attendance_entry_member", columnList = "member_id"),
        @Index(name = "idx_session_attendance_entry_guest", columnList = "guest_id")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupSessionAttendance extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "session_id", nullable = false) private GroupSession session;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "member_id") private GroupMember member;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "guest_id") private GroupSessionGuest guest;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private SessionAttendanceStatus status;
    @Enumerated(EnumType.STRING) @Column(name = "play_status", length = 20) private SessionPlayStatus playStatus;
    @Column(name = "expected_arrival_at") private LocalDateTime expectedArrivalAt;
    @Column(name = "late_reason", length = 300) private String lateReason;
    @Column(name = "arrived_at") private LocalDateTime arrivedAt;
    @Column(name = "consecutive_play_count", nullable = false) private int consecutivePlayCount;
    @Column(name = "consecutive_rest_count", nullable = false) private int consecutiveRestCount;
    @Column(name = "operator_memo", length = 500) private String operatorMemo;
    @Column(name = "doubles_mmr_snapshot") private Integer doublesMmrSnapshot;
    @Column(name = "mixed_mmr_snapshot") private Integer mixedMmrSnapshot;
    @Column(name = "current_doubles_mmr") private Integer currentDoublesMmr;
    @Column(name = "current_mixed_mmr") private Integer currentMixedMmr;

    public static GroupSessionAttendance forMember(GroupSession session, GroupMember member) {
        GroupSessionAttendance entry = new GroupSessionAttendance();
        entry.session = session; entry.member = member; entry.status = SessionAttendanceStatus.REGISTERED; entry.playStatus = SessionPlayStatus.WAITING;
        entry.consecutivePlayCount = 0; entry.consecutiveRestCount = 0;
        entry.doublesMmrSnapshot = member.getUser().getDoublesMmr(); entry.mixedMmrSnapshot = member.getUser().getMixedMmr();
        entry.currentDoublesMmr = entry.doublesMmrSnapshot; entry.currentMixedMmr = entry.mixedMmrSnapshot;
        return entry;
    }

    public static GroupSessionAttendance forGuest(GroupSession session, GroupSessionGuest guest) {
        GroupSessionAttendance entry = new GroupSessionAttendance();
        entry.session = session; entry.guest = guest; entry.status = SessionAttendanceStatus.REGISTERED; entry.playStatus = SessionPlayStatus.WAITING;
        entry.consecutivePlayCount = 0; entry.consecutiveRestCount = 0;
        int initial = guest.getUser() != null ? guest.getUser().getDoublesMmr() : guest.getGrade().getInitialMmr();
        int mixedInitial = guest.getUser() != null ? guest.getUser().getMixedMmr() : guest.getGrade().getInitialMmr();
        entry.doublesMmrSnapshot = initial; entry.mixedMmrSnapshot = mixedInitial;
        entry.currentDoublesMmr = initial; entry.currentMixedMmr = mixedInitial;
        return entry;
    }

    public void arrive() {
        boolean alreadyArrived = status == SessionAttendanceStatus.ARRIVED;
        status = SessionAttendanceStatus.ARRIVED;
        if (!alreadyArrived) playStatus = SessionPlayStatus.AVAILABLE;
        if (arrivedAt == null) arrivedAt = LocalDateTime.now();
        expectedArrivalAt = null; lateReason = null;
    }

    public void late(LocalDateTime expectedArrivalAt, String reason) {
        status = SessionAttendanceStatus.LATE; playStatus = SessionPlayStatus.WAITING; this.expectedArrivalAt = expectedArrivalAt; lateReason = reason; arrivedAt = null;
    }

    public void absent() {
        status = SessionAttendanceStatus.ABSENT; playStatus = SessionPlayStatus.ABSENT; expectedArrivalAt = null; lateReason = null; arrivedAt = null;
    }

    public void register() {
        if (playStatus == SessionPlayStatus.PLAYING || playStatus == SessionPlayStatus.CALLING || playStatus == SessionPlayStatus.NEXT_UP) return;
        status = SessionAttendanceStatus.REGISTERED; playStatus = SessionPlayStatus.WAITING;
        expectedArrivalAt = null; lateReason = null; arrivedAt = null;
    }

    public void toggleRest() {
        if (playStatus == SessionPlayStatus.RESTING) {
            playStatus = SessionPlayStatus.AVAILABLE;
            return;
        }
        if (playStatus == SessionPlayStatus.AVAILABLE || playStatus == SessionPlayStatus.WAITING
                || playStatus == SessionPlayStatus.NEXT_UP || playStatus == SessionPlayStatus.RESTING) {
            playStatus = SessionPlayStatus.RESTING;
        }
    }

    public void startPlaying() {
        status = SessionAttendanceStatus.ARRIVED;
        playStatus = SessionPlayStatus.PLAYING;
        if (arrivedAt == null) arrivedAt = LocalDateTime.now();
        expectedArrivalAt = null;
        lateReason = null;
    }

    public void schedule() {
        if (playStatus != SessionPlayStatus.PLAYING && playStatus != SessionPlayStatus.LEFT && playStatus != SessionPlayStatus.ABSENT) {
            playStatus = SessionPlayStatus.NEXT_UP;
        }
    }

    public void call() {
        if (playStatus != SessionPlayStatus.PLAYING && playStatus != SessionPlayStatus.LEFT && playStatus != SessionPlayStatus.ABSENT) {
            playStatus = SessionPlayStatus.CALLING;
        }
    }

    public void finishPlaying() {
        playStatus = SessionPlayStatus.AVAILABLE;
        consecutivePlayCount++;
        consecutiveRestCount = 0;
    }

    public void countRest() {
        if (playStatus == SessionPlayStatus.AVAILABLE || playStatus == SessionPlayStatus.WAITING
                || playStatus == SessionPlayStatus.NEXT_UP || playStatus == SessionPlayStatus.RESTING) {
            consecutiveRestCount++;
            consecutivePlayCount = 0;
        }
    }

    public void leaveEarly() {
        if (playStatus == SessionPlayStatus.PLAYING || playStatus == SessionPlayStatus.CALLING || playStatus == SessionPlayStatus.NEXT_UP) {
            throw new IllegalStateException("active match participant cannot leave");
        }
        playStatus = SessionPlayStatus.LEFT;
    }

    public void changePlayStatus(SessionPlayStatus next) {
        if (next == SessionPlayStatus.PLAYING) startPlaying();
        else if (next == SessionPlayStatus.LEFT) leaveEarly();
        else playStatus = next;
    }

    public void overridePlayStatus(SessionPlayStatus next) {
        playStatus = next;
        if (next == SessionPlayStatus.PLAYING || next == SessionPlayStatus.CALLING || next == SessionPlayStatus.NEXT_UP
                || next == SessionPlayStatus.AVAILABLE || next == SessionPlayStatus.RESTING) {
            status = SessionAttendanceStatus.ARRIVED;
            if (arrivedAt == null) arrivedAt = LocalDateTime.now();
            expectedArrivalAt = null;
            lateReason = null;
        }
    }

    public void resetOperationState() {
        consecutivePlayCount = 0;
        consecutiveRestCount = 0;
        playStatus = status == SessionAttendanceStatus.ARRIVED ? SessionPlayStatus.AVAILABLE
                : status == SessionAttendanceStatus.ABSENT ? SessionPlayStatus.ABSENT : SessionPlayStatus.WAITING;
        if (member != null) {
            currentDoublesMmr = member.getUser().getDoublesMmr();
            currentMixedMmr = member.getUser().getMixedMmr();
        } else {
            currentDoublesMmr = doublesMmrSnapshot;
            currentMixedMmr = mixedMmrSnapshot;
        }
    }

    public void updateOperatorMemo(String memo) { operatorMemo = memo == null || memo.isBlank() ? null : memo.trim(); }
    public int currentDoublesMmr(int fallback) { return currentDoublesMmr == null ? fallback : currentDoublesMmr; }
    public int currentMixedMmr(int fallback) { return currentMixedMmr == null ? fallback : currentMixedMmr; }
    public void applyDoublesMmr(int delta, int fallback) { currentDoublesMmr = Math.max(0, currentDoublesMmr(fallback) + delta); }
    public void applyMixedMmr(int delta, int fallback) { currentMixedMmr = Math.max(0, currentMixedMmr(fallback) + delta); }
    public void syncDoublesMmr(int value) { currentDoublesMmr = Math.max(0, value); }
    public void syncMixedMmr(int value) { currentMixedMmr = Math.max(0, value); }
}
