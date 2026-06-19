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

    public static GroupSessionAttendance forMember(GroupSession session, GroupMember member) {
        GroupSessionAttendance entry = new GroupSessionAttendance();
        entry.session = session; entry.member = member; entry.status = SessionAttendanceStatus.REGISTERED; entry.playStatus = SessionPlayStatus.WAITING;
        return entry;
    }

    public static GroupSessionAttendance forGuest(GroupSession session, GroupSessionGuest guest) {
        GroupSessionAttendance entry = new GroupSessionAttendance();
        entry.session = session; entry.guest = guest; entry.status = SessionAttendanceStatus.REGISTERED; entry.playStatus = SessionPlayStatus.WAITING;
        return entry;
    }

    public void arrive() {
        status = SessionAttendanceStatus.ARRIVED; playStatus = SessionPlayStatus.AVAILABLE; arrivedAt = LocalDateTime.now(); expectedArrivalAt = null; lateReason = null;
    }

    public void late(LocalDateTime expectedArrivalAt, String reason) {
        status = SessionAttendanceStatus.LATE; playStatus = SessionPlayStatus.WAITING; this.expectedArrivalAt = expectedArrivalAt; lateReason = reason; arrivedAt = null;
    }

    public void absent() {
        status = SessionAttendanceStatus.ABSENT; playStatus = SessionPlayStatus.ABSENT; expectedArrivalAt = null; lateReason = null; arrivedAt = null;
    }

    public void toggleRest() {
        if (playStatus == SessionPlayStatus.RESTING) {
            playStatus = SessionPlayStatus.AVAILABLE;
            return;
        }
        if (playStatus == SessionPlayStatus.AVAILABLE || playStatus == SessionPlayStatus.WAITING) {
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
}
