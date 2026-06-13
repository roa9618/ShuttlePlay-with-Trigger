package com.shuttleplay.server.domain.group.service;

import com.shuttleplay.server.domain.group.entity.*;
import com.shuttleplay.server.domain.group.enums.*;
import com.shuttleplay.server.domain.group.repository.*;
import com.shuttleplay.server.domain.notification.enums.NotificationType;
import com.shuttleplay.server.domain.notification.service.NotificationService;
import com.shuttleplay.server.domain.user.entity.User;
import java.time.LocalDateTime;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GroupNotificationDispatchService {
    private final GroupSessionRepository sessions;
    private final GroupMemberRepository members;
    private final GroupSessionVoteRepository votes;
    private final GroupNotificationDispatchRepository dispatches;
    private final NotificationService notifications;

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void dispatchScheduledNotifications() {
        LocalDateTime now = LocalDateTime.now();
        sessions.findAllByVoteDeadlineBetweenAndIsDeletedFalse(now.plusMinutes(29), now.plusMinutes(31))
                .forEach(session -> notifyUnvoted(session, "VOTE_IMMINENT", "참여 투표 마감이 임박했습니다."));
        sessions.findAllByVoteDeadlineBetweenAndIsDeletedFalse(now.minusMinutes(1), now)
                .forEach(session -> notifyAll(session, "VOTE_CLOSED", "참여 투표가 마감되었습니다."));
        sessions.findAllByStartsAtBetweenAndIsDeletedFalse(now.minusMinutes(1), now.plusMinutes(1))
                .forEach(session -> notifyParticipantsAndManagers(session, "SESSION_START", "오늘 운동 일정이 시작됩니다."));
    }

    public void notifyManagers(Group group, String event, String message) {
        members.findAllByGroupIdAndStatus(group.getId(), GroupMemberStatus.ACTIVE).stream()
                .filter(member -> member.getRole() != GroupMemberRole.MEMBER)
                .forEach(member -> send(group, member.getUser(), event, message));
    }

    private void notifyUnvoted(GroupSession session, String event, String message) {
        Set<Long> votedIds = new HashSet<>();
        for (SessionVoteStatus status : SessionVoteStatus.values()) {
            votes.findAllBySessionIdAndStatus(session.getId(), status).forEach(vote -> votedIds.add(vote.getMember().getId()));
        }
        members.findAllByGroupIdAndStatus(session.getGroup().getId(), GroupMemberStatus.ACTIVE).stream()
                .filter(member -> !votedIds.contains(member.getId()))
                .forEach(member -> send(session.getGroup(), member.getUser(), event + ":" + session.getId(), message));
    }
    private void notifyAll(GroupSession session, String event, String message) {
        members.findAllByGroupIdAndStatus(session.getGroup().getId(), GroupMemberStatus.ACTIVE)
                .forEach(member -> send(session.getGroup(), member.getUser(), event + ":" + session.getId(), message));
    }
    private void notifyParticipantsAndManagers(GroupSession session, String event, String message) {
        Set<User> targets = new HashSet<>();
        votes.findAllBySessionIdAndStatus(session.getId(), SessionVoteStatus.ATTENDING).forEach(vote -> targets.add(vote.getMember().getUser()));
        members.findAllByGroupIdAndStatus(session.getGroup().getId(), GroupMemberStatus.ACTIVE).stream()
                .filter(member -> member.getRole() != GroupMemberRole.MEMBER).forEach(member -> targets.add(member.getUser()));
        targets.forEach(user -> send(session.getGroup(), user, event + ":" + session.getId(), message));
    }
    private void send(Group group, User user, String eventKey, String message) {
        if (dispatches.existsByEventKeyAndUserId(eventKey, user.getId())) return;
        notifications.send(user, NotificationType.GROUP, group.getName(), message, "/groups/" + group.getId());
        dispatches.save(GroupNotificationDispatch.create(eventKey, user));
    }
}
