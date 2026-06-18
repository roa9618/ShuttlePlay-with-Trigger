package com.shuttleplay.server.domain.record.entity;

import com.shuttleplay.server.domain.group.entity.GroupSession;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "session_attendances", uniqueConstraints = @UniqueConstraint(
        name = "uk_session_attendances_session_user", columnNames = {"session_id", "user_id"}), indexes = {
        @Index(name = "idx_session_attendances_user_attended", columnList = "user_id,attended_at")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionAttendance extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "session_id", nullable = false) private GroupSession session;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "attended_at", nullable = false) private LocalDateTime attendedAt;
    @Column(name = "left_at") private LocalDateTime leftAt;

    public static SessionAttendance checkIn(GroupSession session, User user, LocalDateTime attendedAt) {
        SessionAttendance attendance = new SessionAttendance();
        attendance.session = session;
        attendance.user = user;
        attendance.attendedAt = attendedAt;
        return attendance;
    }

    public void checkOut(LocalDateTime leftAt) { this.leftAt = leftAt; }
}
