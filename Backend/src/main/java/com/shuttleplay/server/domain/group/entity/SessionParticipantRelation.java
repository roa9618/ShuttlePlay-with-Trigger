package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.domain.group.enums.ParticipantRelationType;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "session_participant_relations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_session_participant_relation", columnNames = {"session_id", "first_attendance_id", "second_attendance_id", "relation_type"})
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionParticipantRelation extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "session_id", nullable = false) private GroupSession session;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "first_attendance_id", nullable = false) private GroupSessionAttendance firstAttendance;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "second_attendance_id", nullable = false) private GroupSessionAttendance secondAttendance;
    @Enumerated(EnumType.STRING) @Column(name = "relation_type", nullable = false, length = 30) private ParticipantRelationType relationType;

    public static SessionParticipantRelation create(GroupSession session, GroupSessionAttendance first,
                                                    GroupSessionAttendance second, ParticipantRelationType type) {
        SessionParticipantRelation relation = new SessionParticipantRelation();
        relation.session = session;
        relation.firstAttendance = first.getId() < second.getId() ? first : second;
        relation.secondAttendance = first.getId() < second.getId() ? second : first;
        relation.relationType = type;
        return relation;
    }
}
