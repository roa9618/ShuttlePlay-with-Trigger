package com.shuttleplay.server.domain.group.entity;

import com.shuttleplay.server.domain.group.enums.SessionVoteStatus;
import com.shuttleplay.server.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name = "group_session_votes", uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "member_id"}))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupSessionVote extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "session_id") private GroupSession session;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "member_id") private GroupMember member;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private SessionVoteStatus status;

    public static GroupSessionVote create(GroupSession session, GroupMember member, SessionVoteStatus status) {
        GroupSessionVote vote = new GroupSessionVote();
        vote.session = session; vote.member = member; vote.status = status;
        return vote;
    }
    public void updateStatus(SessionVoteStatus status) { this.status = status; }
}
