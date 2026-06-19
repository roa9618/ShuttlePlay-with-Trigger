package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.domain.group.enums.SessionVoteStatus;
import com.shuttleplay.server.domain.user.enums.*;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name = "group_session_guests", uniqueConstraints = @UniqueConstraint(name = "uk_session_guest_user", columnNames = {"session_id", "user_id"}))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupSessionGuest extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "session_id") private GroupSession session;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @Column(nullable = false, length = 50) private String name;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Gender gender;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private AgeGroup ageGroup;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private Grade grade;
    @Column(length = 50) private String affiliation;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private SessionVoteStatus status;

    public static GroupSessionGuest create(GroupSession session, String name, Gender gender, AgeGroup ageGroup, Grade grade, String affiliation) {
        GroupSessionGuest guest = new GroupSessionGuest();
        guest.session = session; guest.update(name, gender, ageGroup, grade, affiliation); guest.status = SessionVoteStatus.ATTENDING;
        return guest;
    }
    public static GroupSessionGuest create(GroupSession session, String name, Gender gender, AgeGroup ageGroup, Grade grade) {
        return create(session, name, gender, ageGroup, grade, null);
    }
    public void update(String name, Gender gender, AgeGroup ageGroup, Grade grade, String affiliation) {
        this.name = name; this.gender = gender; this.ageGroup = ageGroup; this.grade = grade;
        this.affiliation = affiliation == null || affiliation.isBlank() ? null : affiliation.trim();
    }
    public void update(String name, Gender gender, AgeGroup ageGroup, Grade grade) {
        update(name, gender, ageGroup, grade, affiliation);
    }

    public void updateStatus(SessionVoteStatus status) {
        this.status = status;
    }

    public void linkUser(User user) { if (this.user == null) this.user = user; }
}
