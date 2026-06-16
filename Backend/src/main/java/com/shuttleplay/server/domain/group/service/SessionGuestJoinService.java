package com.shuttleplay.server.domain.group.service;

import com.shuttleplay.server.domain.group.entity.Group;
import com.shuttleplay.server.domain.group.entity.GroupMember;
import com.shuttleplay.server.domain.group.entity.GroupSession;
import com.shuttleplay.server.domain.group.entity.GroupSessionGuest;
import com.shuttleplay.server.domain.group.entity.GroupSessionVote;
import com.shuttleplay.server.domain.group.enums.GroupMemberStatus;
import com.shuttleplay.server.domain.group.enums.GroupSessionStatus;
import com.shuttleplay.server.domain.group.enums.SessionVoteStatus;
import com.shuttleplay.server.domain.group.repository.GroupMemberRepository;
import com.shuttleplay.server.domain.group.repository.GroupSessionGuestRepository;
import com.shuttleplay.server.domain.group.repository.GroupSessionRepository;
import com.shuttleplay.server.domain.group.repository.GroupSessionVoteRepository;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.AgeGroup;
import com.shuttleplay.server.domain.user.enums.Gender;
import com.shuttleplay.server.domain.user.enums.Grade;
import com.shuttleplay.server.domain.user.enums.UserStatus;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import com.shuttleplay.server.global.security.JwtTokenProvider;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SessionGuestJoinService {
    private static final Duration GUEST_TOKEN_DURATION = Duration.ofDays(30);

    private final GroupSessionRepository sessions;
    private final GroupMemberRepository members;
    private final GroupSessionVoteRepository votes;
    private final GroupSessionGuestRepository guests;
    private final UserRepository users;
    private final GroupEventService events;
    private final JwtTokenProvider jwtTokenProvider;

    public record GuestJoinResult(Map<String, Object> data, String guestToken) {
        public boolean hasGuestToken() {
            return guestToken != null && !guestToken.isBlank();
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> preview(Long sessionId, Long userId, String guestToken) {
        GroupSession session = guestJoinableSession(sessionId);
        Map<String, Object> result = sessionMap(session);

        if (userId == null) {
            result.put("participantType", "GUEST");
            result.put("profileCompleted", false);
            GroupSessionGuest guest = findGuestByToken(sessionId, guestToken);
            if (guest != null) {
                putGuestIdentity(result, guest);
            }
            return result;
        }

        User user = users.findById(userId)
                .filter(User::isActive)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        result.put("profileCompleted", user.isProfileCompleted());
        result.put("name", user.getName());
        result.put("gender", user.getGender());
        result.put("ageGroup", user.getAgeGroup());
        result.put("grade", user.getGrade());
        result.put("profileImageUrl", user.getProfileImageUrl());

        members.findByGroupIdAndUserIdAndStatus(session.getGroup().getId(), userId, GroupMemberStatus.ACTIVE)
                .ifPresentOrElse(member -> {
                    result.put("participantType", "MEMBER");
                    result.put("currentVoteStatus", votes.findBySessionIdAndMemberId(sessionId, member.getId())
                            .map(GroupSessionVote::getStatus)
                            .orElse(SessionVoteStatus.UNDECIDED));
                }, () -> {
                    result.put("participantType", "USER_GUEST");
                    if (user.isProfileCompleted()) {
                        result.put("currentVoteStatus", guests.findBySessionIdAndNameIgnoreCaseAndGenderAndAgeGroupAndGrade(
                                        sessionId,
                                        user.getName(),
                                        user.getGender(),
                                        user.getAgeGroup(),
                                        user.getGrade()
                                )
                                .map(GroupSessionGuest::getStatus)
                                .orElse(null));
                    }
                });

        return result;
    }

    @Transactional
    public GuestJoinResult submit(Long sessionId, Long userId, Map<String, Object> body, String guestToken) {
        GroupSession session = guestJoinableSession(sessionId);
        assertVotingAvailable(session);

        SessionVoteStatus status = voteStatus(body);
        if (userId != null) {
            User user = users.findById(userId)
                    .filter(User::isActive)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            Group group = session.getGroup();

            GroupMember member = members.findByGroupIdAndUserIdAndStatus(group.getId(), userId, GroupMemberStatus.ACTIVE)
                    .orElse(null);

            if (member != null) {
                GroupSessionVote vote = votes.findBySessionIdAndMemberId(sessionId, member.getId())
                        .map(existing -> {
                            existing.updateStatus(status);
                            return existing;
                        })
                        .orElseGet(() -> votes.save(GroupSessionVote.create(session, member, status)));
                refreshAttendanceCount(session);
                events.sessions(group.getId(), "VOTE_UPDATED");
                return new GuestJoinResult(authenticatedResponse(sessionId, userId, vote.getStatus()), null);
            }

            if (!user.isProfileCompleted() || user.getGender() == null || user.getAgeGroup() == null || user.getGrade() == null) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }

            upsertGuest(session, user.getName(), user.getGender(), user.getAgeGroup(), user.getGrade(), status);
            refreshAttendanceCount(session);
            events.sessions(group.getId(), "GUEST_VOTE_UPDATED");
            return new GuestJoinResult(authenticatedResponse(sessionId, userId, status), null);
        }

        String name = text(body, "name");
        Gender gender = enumValue(Gender.class, text(body, "gender"));
        AgeGroup ageGroup = enumValue(AgeGroup.class, text(body, "ageGroup"));
        Grade grade = enumValue(Grade.class, text(body, "grade"));
        GroupSessionGuest guest = findGuestByToken(sessionId, guestToken);
        if (guest == null) {
            guest = upsertGuest(session, name, gender, ageGroup, grade, status);
        } else {
            guest.update(name, gender, ageGroup, grade);
            guest.updateStatus(status);
        }
        refreshAttendanceCount(session);
        events.sessions(session.getGroup().getId(), "GUEST_VOTE_UPDATED");
        Map<String, Object> result = response(session, status, "GUEST");
        putGuestIdentity(result, guest);
        result.put("profileCompleted", false);
        return new GuestJoinResult(
                result,
                jwtTokenProvider.createGuestSessionToken(sessionId, guest.getId(), GUEST_TOKEN_DURATION.toMillis())
        );
    }

    private GroupSession guestJoinableSession(Long sessionId) {
        GroupSession session = sessions.findByIdAndIsDeletedFalse(sessionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        if (!session.getGroup().isGuestAllowed() || !session.isGuestAllowed() || !session.isGuestLinkAllowed()) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        if (session.getStatus() == GroupSessionStatus.CANCELLED || session.getStatus() == GroupSessionStatus.CLOSED) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return session;
    }

    private void assertVotingAvailable(GroupSession session) {
        if (!session.isVotingAllowed()) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        LocalDateTime now = LocalDateTime.now();
        Group group = session.getGroup();
        if (session.getVoteDeadline() != null && now.isAfter(session.getVoteDeadline()) && !group.isPostDeadlineVoteChangeAllowed()) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        if (session.getStartsAt().toLocalDate().equals(now.toLocalDate()) && !group.isSameDayVoteChangeAllowed()) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private GroupSessionGuest upsertGuest(GroupSession session, String name, Gender gender, AgeGroup ageGroup, Grade grade, SessionVoteStatus status) {
        GroupSessionGuest guest = guests.findBySessionIdAndNameIgnoreCaseAndGenderAndAgeGroupAndGrade(
                        session.getId(),
                        name,
                        gender,
                        ageGroup,
                        grade
                )
                .orElseGet(() -> guests.save(GroupSessionGuest.create(session, name, gender, ageGroup, grade)));
        guest.updateStatus(status);
        return guest;
    }

    private void refreshAttendanceCount(GroupSession session) {
        session.updateAttendanceCount((int) (votes.countBySessionIdAndStatus(session.getId(), SessionVoteStatus.ATTENDING)
                + guests.countBySessionIdAndStatus(session.getId(), SessionVoteStatus.ATTENDING)));
    }

    private Map<String, Object> sessionMap(GroupSession session) {
        Map<String, Object> result = new LinkedHashMap<>();
        Group group = session.getGroup();
        result.put("groupId", group.getId());
        result.put("groupName", group.getName());
        result.put("sessionId", session.getId());
        result.put("title", session.getTitle());
        result.put("startsAt", session.getStartsAt());
        result.put("endsAt", session.getEndsAt());
        result.put("place", session.getPlace());
        result.put("voteDeadline", session.getVoteDeadline());
        result.put("sessionType", session.getSessionType());
        result.put("status", session.getStatus());
        result.put("votingAllowed", session.isVotingAllowed());
        result.put("guestAllowed", session.isGuestAllowed());
        result.put("guestLinkAllowed", session.isGuestLinkAllowed());
        result.put("attending", votes.countBySessionIdAndStatus(session.getId(), SessionVoteStatus.ATTENDING)
                + guests.countBySessionIdAndStatus(session.getId(), SessionVoteStatus.ATTENDING));
        result.put("undecided", undecidedCount(session));
        result.put("absent", votes.countBySessionIdAndStatus(session.getId(), SessionVoteStatus.ABSENT)
                + guests.countBySessionIdAndStatus(session.getId(), SessionVoteStatus.ABSENT));
        return result;
    }

    private Map<String, Object> response(GroupSession session, SessionVoteStatus status, String participantType) {
        Map<String, Object> result = sessionMap(session);
        result.put("participantType", participantType);
        result.put("currentVoteStatus", status);
        return result;
    }

    private Map<String, Object> authenticatedResponse(Long sessionId, Long userId, SessionVoteStatus status) {
        Map<String, Object> result = preview(sessionId, userId, null);
        result.put("currentVoteStatus", status);
        return result;
    }

    private GroupSessionGuest findGuestByToken(Long sessionId, String guestToken) {
        return jwtTokenProvider.getGuestSessionTokenClaims(guestToken)
                .filter(claims -> claims.sessionId().equals(sessionId))
                .flatMap(claims -> guests.findByIdAndSessionId(claims.guestId(), sessionId))
                .orElse(null);
    }

    private void putGuestIdentity(Map<String, Object> result, GroupSessionGuest guest) {
        result.put("name", guest.getName());
        result.put("gender", guest.getGender());
        result.put("ageGroup", guest.getAgeGroup());
        result.put("grade", guest.getGrade());
        result.put("currentVoteStatus", guest.getStatus());
    }

    private long undecidedCount(GroupSession session) {
        long activeMembers = members.countByGroupIdAndStatus(session.getGroup().getId(), GroupMemberStatus.ACTIVE);
        long votedMembers = votes.countBySessionId(session.getId());
        return Math.max(0, activeMembers - votedMembers)
                + votes.countBySessionIdAndStatus(session.getId(), SessionVoteStatus.UNDECIDED)
                + guests.countBySessionIdAndStatus(session.getId(), SessionVoteStatus.UNDECIDED);
    }

    private static SessionVoteStatus voteStatus(Map<String, Object> body) {
        return enumValue(SessionVoteStatus.class, text(body, "status"));
    }

    private static String text(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (value == null || String.valueOf(value).isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        return String.valueOf(value).trim();
    }

    private static <T extends Enum<T>> T enumValue(Class<T> type, String value) {
        try {
            return Enum.valueOf(type, value);
        } catch (IllegalArgumentException exception) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
    }
}
