package com.shuttleplay.server.domain.group.service;

import com.shuttleplay.server.domain.group.entity.*;
import com.shuttleplay.server.domain.group.enums.*;
import com.shuttleplay.server.domain.group.repository.*;
import com.shuttleplay.server.domain.notification.enums.NotificationPreferenceType;
import com.shuttleplay.server.domain.notification.enums.NotificationType;
import com.shuttleplay.server.domain.notification.service.NotificationService;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.*;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.global.error.*;
import com.shuttleplay.server.global.security.JwtTokenProvider;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SessionEntryService {
    private static final Duration ENTRY_OPEN_BEFORE = Duration.ofHours(1);
    private static final Duration GUEST_TOKEN_DURATION = Duration.ofDays(30);
    private final GroupSessionRepository sessions;
    private final GroupMemberRepository members;
    private final GroupSessionVoteRepository votes;
    private final GroupSessionGuestRepository guests;
    private final GroupSessionAttendanceRepository attendanceEntries;
    private final UserRepository users;
    private final SessionEntryCodeService codes;
    private final GroupEventService events;
    private final NotificationService notifications;
    private final JwtTokenProvider tokenProvider;

    public record EntryResult(Map<String, Object> data, String guestToken) {}
    private record Participant(GroupMember member, GroupSessionGuest guest, SessionVoteStatus voteStatus) {}

    @Transactional
    public Map<String, Object> previewByCode(String rawCode, Long userId, Map<Long, String> guestTokens) {
        String code = normalizeCode(rawCode);
        GroupSession session = sessions.findByEntryCodeAndIsDeletedFalse(code)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        return preview(session, userId, guestTokens.get(session.getId()));
    }

    @Transactional
    public Map<String, Object> previewBySession(Long sessionId, Long userId, String guestToken, String rawCode) {
        GroupSession session = session(sessionId);
        assertEntryAccess(session, userId, guestToken, rawCode);
        return preview(session, userId, guestToken);
    }

    @Transactional
    public EntryResult decide(Long sessionId, Long userId, boolean registered, Map<String, Object> body, String guestToken, String rawCode) {
        GroupSession session = session(sessionId);
        assertEntryAccess(session, userId, guestToken, rawCode);
        if (!isEntryOpen(session)) return restrictedResult(session, userId, guestToken);
        Participant participant = identify(session, userId, guestToken, body);
        if (registered) {
            if (participant == null || participant.voteStatus() == null) {
                Map<String, Object> result = preview(session, userId, guestToken);
                result.put("restrictionReason", "REGISTRATION_NOT_FOUND");
                return new EntryResult(result, null);
            }
            return result(session, userId, participant, guestToken(sessionId, userId, participant));
        }

        if (participant != null && participant.voteStatus() != null) return result(session, userId, participant, guestToken(sessionId, userId, participant));
        if (!canRegister(session, userId)) return restrictedResult(session, userId, guestToken);
        Participant created = register(session, userId, body);
        String token = guestToken(sessionId, userId, created);
        refreshAttendanceCount(session);
        events.sessions(session.getGroup().getId(), "SESSION_ENTRY_REGISTERED");
        notifyScheduleManagers(
                session,
                "새 참가자가 등록됐어요",
                participantName(created) + "님이 " + session.getTitle() + "에 참가 등록했어요."
        );
        return result(session, userId, created, token);
    }

    @Transactional
    public EntryResult attendance(Long sessionId, Long userId, Map<String, Object> body, String guestToken) {
        GroupSession session = session(sessionId);
        if (!isEntryOpen(session)) return restrictedResult(session, userId, guestToken);
        Participant participant = identify(session, userId, guestToken, body);
        if (participant == null || participant.voteStatus() == null) throw new BusinessException(ErrorCode.FORBIDDEN);
        SessionAttendanceStatus requested = enumValue(SessionAttendanceStatus.class, text(body, "status"));
        if ((requested == SessionAttendanceStatus.ARRIVED || requested == SessionAttendanceStatus.LATE)
                && participant.voteStatus() == SessionVoteStatus.ABSENT && !canChangeParticipation(session)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        GroupSessionAttendance entry = attendanceEntry(session, participant);
        if (requested == SessionAttendanceStatus.ABSENT && participant.voteStatus() != SessionVoteStatus.ABSENT && !canChangeParticipation(session)) {
            Map<String, Object> data = preview(session, userId, guestToken);
            data.put("restrictionReason", "PARTICIPATION_CHANGE_LOCKED");
            return new EntryResult(data, null);
        }
        if (requested == SessionAttendanceStatus.ARRIVED) {
            updateVote(session, participant, SessionVoteStatus.ATTENDING); entry.arrive();
        } else if (requested == SessionAttendanceStatus.LATE) {
            int minutes = integer(body, "lateMinutes");
            if (minutes < 1 || minutes > 180) throw new BusinessException(ErrorCode.INVALID_REQUEST);
            updateVote(session, participant, SessionVoteStatus.ATTENDING);
            entry.late(LocalDateTime.now().plusMinutes(minutes), optionalText(body, "reason", 300));
        } else if (requested == SessionAttendanceStatus.ABSENT) {
            updateVote(session, participant, SessionVoteStatus.ABSENT); entry.absent();
        } else throw new BusinessException(ErrorCode.INVALID_REQUEST);
        refreshAttendanceCount(session);
        events.sessions(session.getGroup().getId(), "ATTENDANCE_UPDATED");
        notifyScheduleManagers(
                session,
                "출석 상태가 변경됐어요",
                participantName(participant) + "님이 " + attendanceLabel(requested) + " 상태로 변경했어요."
        );
        String token = participant.guest() != null && userId == null
                ? tokenProvider.createGuestSessionToken(sessionId, participant.guest().getId(), GUEST_TOKEN_DURATION.toMillis()) : null;
        return result(session, userId, new Participant(participant.member(), participant.guest(), requested == SessionAttendanceStatus.ABSENT ? SessionVoteStatus.ABSENT : SessionVoteStatus.ATTENDING), token);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> status(Long sessionId, Long userId, String guestToken) {
        GroupSession session = session(sessionId);
        Participant participant = identify(session, userId, guestToken, Map.of());
        if (participant == null || participant.voteStatus() == null) throw new BusinessException(ErrorCode.FORBIDDEN);

        Map<String, Object> result = sessionMap(session);
        putParticipant(session, result, participant);

        GroupSessionAttendance attendance = participant.member() != null
                ? attendanceEntries.findBySessionIdAndMemberId(session.getId(), participant.member().getId()).orElse(null)
                : attendanceEntries.findBySessionIdAndGuestId(session.getId(), participant.guest().getId()).orElse(null);

        result.put("expectedArrivalAt", attendance == null ? null : attendance.getExpectedArrivalAt());
        result.put("lateReason", attendance == null ? null : attendance.getLateReason());
        result.put("arrivedAt", attendance == null ? null : attendance.getArrivedAt());
        result.put("gameStatus", "WAITING");
        result.put("nextMatch", null);
        result.put("todayStats", Map.of("games", 0, "wins", 0, "losses", 0));
        return result;
    }

    private Map<String, Object> preview(GroupSession session, Long userId, String guestToken) {
        codes.ensureCode(session);
        Map<String, Object> result = sessionMap(session);
        Participant participant = identify(session, userId, guestToken, Map.of());
        putParticipant(session, result, participant);
        if (userId != null) {
            User user = users.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            result.put("profileCompleted", user.isProfileCompleted());
            result.put("loggedIn", true);
            result.put("operator", user.getRole() == UserRole.ADMIN || members.findByGroupIdAndUserIdAndStatus(session.getGroup().getId(), userId, GroupMemberStatus.ACTIVE)
                    .map(member -> member.getRole() != GroupMemberRole.MEMBER).orElse(false));
        } else {
            result.put("profileCompleted", false); result.put("loggedIn", false); result.put("operator", false);
        }
        result.put("canRegister", canRegister(session, userId));
        result.put("restrictionReason", restrictionReason(session, userId, participant));
        return result;
    }

    private EntryResult result(GroupSession session, Long userId, Participant participant, String token) {
        Map<String, Object> data = preview(session, userId, token);
        putParticipant(session, data, participant);
        return new EntryResult(data, token);
    }

    private EntryResult restrictedResult(GroupSession session, Long userId, String guestToken) {
        return new EntryResult(preview(session, userId, guestToken), null);
    }

    private String guestToken(Long sessionId, Long userId, Participant participant) {
        return participant != null && participant.guest() != null && userId == null
                ? tokenProvider.createGuestSessionToken(sessionId, participant.guest().getId(), GUEST_TOKEN_DURATION.toMillis()) : null;
    }

    private Participant register(GroupSession session, Long userId, Map<String, Object> body) {
        if (!canRegister(session, userId)) throw new BusinessException(ErrorCode.FORBIDDEN);
        if (userId != null) {
            User user = users.findById(userId).filter(User::isActive).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            GroupMember member = members.findByGroupIdAndUserIdAndStatus(session.getGroup().getId(), userId, GroupMemberStatus.ACTIVE).orElse(null);
            if (member != null) {
                GroupSessionVote vote = votes.findBySessionIdAndMemberId(session.getId(), member.getId())
                        .orElseGet(() -> votes.save(GroupSessionVote.create(session, member, SessionVoteStatus.ATTENDING)));
                return new Participant(member, null, vote.getStatus());
            }
            if (!user.isProfileCompleted() || user.getGender() == null || user.getAgeGroup() == null || user.getGrade() == null) throw new BusinessException(ErrorCode.INVALID_REQUEST);
            GroupSessionGuest guest = guestForUser(session, user);
            guest.updateStatus(SessionVoteStatus.ATTENDING);
            return new Participant(null, guest, guest.getStatus());
        }
        GroupSessionGuest guest = guest(session, text(body, "name"), enumValue(Gender.class, text(body, "gender")),
                enumValue(AgeGroup.class, text(body, "ageGroup")), enumValue(Grade.class, text(body, "grade")));
        guest.updateStatus(SessionVoteStatus.ATTENDING);
        return new Participant(null, guest, guest.getStatus());
    }

    private Participant identify(GroupSession session, Long userId, String guestToken, Map<String, Object> body) {
        if (userId != null) {
            User user = users.findById(userId).filter(User::isActive).orElse(null);
            if (user == null) return null;
            Optional<GroupMember> member = members.findByGroupIdAndUserIdAndStatus(session.getGroup().getId(), userId, GroupMemberStatus.ACTIVE);
            if (member.isPresent()) return new Participant(member.get(), null, votes.findBySessionIdAndMemberId(session.getId(), member.get().getId()).map(GroupSessionVote::getStatus).orElse(null));
            if (user.isProfileCompleted() && user.getGender() != null && user.getAgeGroup() != null && user.getGrade() != null) {
                return guests.findBySessionIdAndUserId(session.getId(), userId)
                        .or(() -> guests.findBySessionIdAndNameIgnoreCaseAndGenderAndAgeGroupAndGrade(session.getId(), user.getName(), user.getGender(), user.getAgeGroup(), user.getGrade()).map(guest -> { guest.linkUser(user); return guest; }))
                        .map(guest -> new Participant(null, guest, guest.getStatus())).orElse(null);
            }
            return null;
        }
        GroupSessionGuest tokenGuest = tokenProvider.getGuestSessionTokenClaims(guestToken)
                .filter(claims -> claims.sessionId().equals(session.getId()))
                .flatMap(claims -> guests.findByIdAndSessionId(claims.guestId(), session.getId())).orElse(null);
        if (tokenGuest != null) return new Participant(null, tokenGuest, tokenGuest.getStatus());
        if (body.containsKey("name") && body.containsKey("gender") && body.containsKey("ageGroup") && body.containsKey("grade")) {
            return guests.findBySessionIdAndNameIgnoreCaseAndGenderAndAgeGroupAndGrade(session.getId(), String.valueOf(body.get("name")).trim(),
                    enumValue(Gender.class, String.valueOf(body.get("gender"))), enumValue(AgeGroup.class, String.valueOf(body.get("ageGroup"))), enumValue(Grade.class, String.valueOf(body.get("grade"))))
                    .map(guest -> new Participant(null, guest, guest.getStatus())).orElse(null);
        }
        return null;
    }

    private boolean canRegister(GroupSession session, Long userId) {
        if (!isEntryOpen(session)) return false;
        boolean member = userId != null && members.findByGroupIdAndUserIdAndStatus(session.getGroup().getId(), userId, GroupMemberStatus.ACTIVE).isPresent();
        if (member) return canCreateParticipation(session);
        if (!session.getGroup().isGuestAllowed() || !session.isGuestAllowed()) return false;
        if (userId == null && !session.isGuestLinkAllowed()) return false;
        return canCreateParticipation(session);
    }

    private boolean canCreateParticipation(GroupSession session) {
        if (!session.isVotingAllowed()) return true;
        LocalDateTime now = LocalDateTime.now();
        if (session.getVoteDeadline() != null && now.isAfter(session.getVoteDeadline()) && !session.getGroup().isPostDeadlineVoteChangeAllowed()) return false;
        return !session.getStartsAt().toLocalDate().equals(now.toLocalDate()) || session.getGroup().isSameDayVoteChangeAllowed();
    }

    private boolean canChangeParticipation(GroupSession session) {
        LocalDateTime now = LocalDateTime.now();
        if (session.getStartsAt().toLocalDate().equals(now.toLocalDate()) && !session.getGroup().isSameDayVoteChangeAllowed()) return false;
        return session.getVoteDeadline() == null || !now.isAfter(session.getVoteDeadline()) || session.getGroup().isPostDeadlineVoteChangeAllowed();
    }

    private void assertEntryAccess(GroupSession session, Long userId, String guestToken, String rawCode) {
        boolean member = userId != null && members.findByGroupIdAndUserIdAndStatus(session.getGroup().getId(), userId, GroupMemberStatus.ACTIVE).isPresent();
        if (member || identify(session, userId, guestToken, Map.of()) != null) return;
        if (rawCode == null || !normalizeCode(rawCode).equals(session.getEntryCode())) throw new BusinessException(ErrorCode.FORBIDDEN);
    }

    private String restrictionReason(GroupSession session, Long userId, Participant participant) {
        if (session.getStatus() == GroupSessionStatus.CANCELLED) return "CANCELLED";
        if (session.getStatus() == GroupSessionStatus.CLOSED || isEnded(session)) return "CLOSED";
        if (LocalDateTime.now().isBefore(session.getStartsAt().minus(ENTRY_OPEN_BEFORE))) return "TOO_EARLY";
        if (participant != null && participant.voteStatus() != null) {
            return participant.voteStatus() == SessionVoteStatus.ABSENT && !canChangeParticipation(session) ? "ABSENT_LOCKED" : null;
        }
        boolean member = userId != null && members.findByGroupIdAndUserIdAndStatus(session.getGroup().getId(), userId, GroupMemberStatus.ACTIVE).isPresent();
        if (!member && !session.getGroup().isGuestAllowed()) return "GROUP_GUEST_DISABLED";
        if (!member && !session.isGuestAllowed()) return "SESSION_GUEST_DISABLED";
        if (!member && userId == null && !session.isGuestLinkAllowed()) return "NON_MEMBER_LINK_DISABLED";
        if (!canCreateParticipation(session)) return "REGISTRATION_CLOSED";
        return null;
    }

    private Map<String, Object> sessionMap(GroupSession session) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("sessionId", session.getId()); map.put("entryCode", codes.ensureCode(session)); map.put("groupId", session.getGroup().getId());
        map.put("groupName", session.getGroup().getName()); map.put("title", session.getTitle()); map.put("startsAt", session.getStartsAt());
        map.put("endsAt", session.getEndsAt()); map.put("place", session.getPlace()); map.put("status", session.getStatus());
        map.put("entryOpen", isEntryOpen(session)); map.put("entryOpensAt", session.getStartsAt().minus(ENTRY_OPEN_BEFORE));
        map.put("guestAllowed", session.isGuestAllowed()); map.put("guestLinkAllowed", session.isGuestLinkAllowed()); map.put("groupGuestAllowed", session.getGroup().isGuestAllowed());
        return map;
    }

    private void putParticipant(GroupSession session, Map<String, Object> map, Participant participant) {
        map.put("registered", participant != null && participant.voteStatus() != null);
        if (participant == null) { map.put("participantType", "UNKNOWN"); return; }
        map.put("participantType", participant.member() != null ? "MEMBER" : "GUEST");
        map.put("name", participant.member() != null ? participant.member().getUser().getName() : participant.guest().getName());
        map.put("voteStatus", participant.voteStatus());
        GroupSessionAttendance attendance = participant.member() != null
                ? attendanceEntries.findBySessionIdAndMemberId(session.getId(), participant.member().getId()).orElse(null)
                : attendanceEntries.findBySessionIdAndGuestId(participant.guest().getSession().getId(), participant.guest().getId()).orElse(null);
        map.put("attendanceStatus", attendance == null ? SessionAttendanceStatus.REGISTERED : attendance.getStatus());
    }

    private GroupSessionAttendance attendanceEntry(GroupSession session, Participant participant) {
        if (participant.member() != null) return attendanceEntries.findBySessionIdAndMemberId(session.getId(), participant.member().getId())
                .orElseGet(() -> attendanceEntries.save(GroupSessionAttendance.forMember(session, participant.member())));
        return attendanceEntries.findBySessionIdAndGuestId(session.getId(), participant.guest().getId())
                .orElseGet(() -> attendanceEntries.save(GroupSessionAttendance.forGuest(session, participant.guest())));
    }

    private void updateVote(GroupSession session, Participant participant, SessionVoteStatus status) {
        if (participant.member() != null) votes.findBySessionIdAndMemberId(session.getId(), participant.member().getId()).ifPresent(vote -> vote.updateStatus(status));
        else participant.guest().updateStatus(status);
    }

    private void notifyScheduleManagers(GroupSession session, String title, String message) {
        String targetPath = "/groups/" + session.getGroup().getId() + "/schedule";
        members.findAllByGroupIdAndStatus(session.getGroup().getId(), GroupMemberStatus.ACTIVE).stream()
                .filter(member -> member.getRole() == GroupMemberRole.OWNER
                        || (member.getRole() == GroupMemberRole.MANAGER && member.isSchedulePermission()))
                .map(GroupMember::getUser)
                .filter(User::isActive)
                .forEach(user -> notifications.sendIfEnabled(
                        user,
                        NotificationType.SCHEDULE,
                        title,
                        message,
                        targetPath,
                        NotificationPreferenceType.SCHEDULE_CHANGE
                ));
    }

    private String participantName(Participant participant) {
        return participant.member() != null ? participant.member().getUser().getName() : participant.guest().getName();
    }

    private String attendanceLabel(SessionAttendanceStatus status) {
        return switch (status) {
            case ARRIVED -> "도착 완료";
            case LATE -> "지각 예정";
            case ABSENT -> "불참";
            case REGISTERED -> "참가 등록";
        };
    }

    private GroupSessionGuest guest(GroupSession session, String name, Gender gender, AgeGroup age, Grade grade) {
        return guests.findBySessionIdAndNameIgnoreCaseAndGenderAndAgeGroupAndGrade(session.getId(), name, gender, age, grade)
                .orElseGet(() -> guests.save(GroupSessionGuest.create(session, name, gender, age, grade)));
    }

    private GroupSessionGuest guestForUser(GroupSession session, User user) {
        GroupSessionGuest guest = guests.findBySessionIdAndUserId(session.getId(), user.getId())
                .orElseGet(() -> guest(session, user.getName(), user.getGender(), user.getAgeGroup(), user.getGrade()));
        guest.linkUser(user);
        return guest;
    }

    private void refreshAttendanceCount(GroupSession session) {
        session.updateAttendanceCount((int) (votes.countBySessionIdAndStatus(session.getId(), SessionVoteStatus.ATTENDING) + guests.countBySessionIdAndStatus(session.getId(), SessionVoteStatus.ATTENDING)));
    }

    private GroupSession session(Long id) { return sessions.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); }
    private boolean isEntryOpen(GroupSession session) { LocalDateTime now = LocalDateTime.now(); return session.getStatus() != GroupSessionStatus.CANCELLED && session.getStatus() != GroupSessionStatus.CLOSED && !now.isBefore(session.getStartsAt().minus(ENTRY_OPEN_BEFORE)) && !isEnded(session); }
    private boolean isEnded(GroupSession session) { return session.getEndsAt() != null && LocalDateTime.now().isAfter(session.getEndsAt()); }
    private String normalizeCode(String code) { String value = code == null ? "" : code.replaceAll("[^A-Za-z0-9]", "").toUpperCase(); if (!value.matches("[2-9A-HJ-NP-Z]{8}")) throw new BusinessException(ErrorCode.INVALID_REQUEST); return value; }
    private static String text(Map<String, Object> body, String key) { Object value = body.get(key); if (value == null || String.valueOf(value).isBlank()) throw new BusinessException(ErrorCode.INVALID_REQUEST); return String.valueOf(value).trim(); }
    private static String optionalText(Map<String, Object> body, String key, int max) { String value = String.valueOf(body.getOrDefault(key, "")).trim(); if (value.length() > max) throw new BusinessException(ErrorCode.INVALID_REQUEST); return value.isBlank() ? null : value; }
    private static int integer(Map<String, Object> body, String key) { try { return Integer.parseInt(String.valueOf(body.get(key))); } catch (RuntimeException exception) { throw new BusinessException(ErrorCode.INVALID_REQUEST); } }
    private static <T extends Enum<T>> T enumValue(Class<T> type, String value) { try { return Enum.valueOf(type, value); } catch (RuntimeException exception) { throw new BusinessException(ErrorCode.INVALID_REQUEST); } }
}
