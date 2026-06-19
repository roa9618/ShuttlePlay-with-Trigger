package com.shuttleplay.server.domain.group.service;

import com.shuttleplay.server.domain.group.entity.*;
import com.shuttleplay.server.domain.group.enums.*;
import com.shuttleplay.server.domain.group.repository.*;
import com.shuttleplay.server.domain.notification.enums.NotificationPreferenceType;
import com.shuttleplay.server.domain.notification.enums.NotificationType;
import com.shuttleplay.server.domain.notification.service.NotificationService;
import com.shuttleplay.server.domain.record.entity.MatchPlayer;
import com.shuttleplay.server.domain.record.entity.MatchRecord;
import com.shuttleplay.server.domain.record.repository.MatchPlayerRepository;
import com.shuttleplay.server.domain.record.repository.MatchRecordRepository;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.*;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.global.error.*;
import com.shuttleplay.server.global.security.JwtTokenProvider;
import com.shuttleplay.server.global.util.PublicIdCodec;
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
    private final MatchPlayerRepository matchPlayers;
    private final MatchRecordRepository matchRecords;
    private final SessionOperationService sessionOperations;

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
        events.session(session.getGroup().getId(), session.getId(), "SESSION_ENTRY_REGISTERED");
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
        sessionOperations.reconcileParticipantAvailability(sessionId);
        events.session(session.getGroup().getId(), session.getId(), "ATTENDANCE_UPDATED");
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

        Map<String, Object> result = participantStatus(session, participant);
        return result;
    }

    @Transactional
    public Map<String, Object> toggleRest(Long sessionId, Long userId, String guestToken) {
        GroupSession session = session(sessionId);
        Participant participant = identify(session, userId, guestToken, Map.of());
        if (participant == null || participant.voteStatus() == null) throw new BusinessException(ErrorCode.FORBIDDEN);
        GroupSessionAttendance entry = attendanceEntry(session, participant);
        entry.toggleRest();
        sessionOperations.reconcileParticipantAvailability(sessionId);
        return participantStatus(session, participant);
    }

    @Transactional
    public Map<String, Object> leaveEarly(Long sessionId, Long userId, String guestToken) {
        GroupSession session = session(sessionId);
        Participant participant = identify(session, userId, guestToken, Map.of());
        if (participant == null || participant.voteStatus() == null) throw new BusinessException(ErrorCode.FORBIDDEN);
        GroupSessionAttendance entry = attendanceEntry(session, participant);
        try { entry.leaveEarly(); }
        catch (IllegalStateException exception) { throw new BusinessException(ErrorCode.INVALID_REQUEST); }
        sessionOperations.reconcileParticipantAvailability(sessionId);
        return participantStatus(session, participant);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> nextMatch(Long sessionId, Long userId, String guestToken) {
        GroupSession session = session(sessionId);
        Participant participant = identify(session, userId, guestToken, Map.of());
        if (participant == null || participant.voteStatus() == null) throw new BusinessException(ErrorCode.FORBIDDEN);
        Map<String, Object> result = participantStatus(session, participant);
        result.put("alertType", "NEXT_UP");
        result.put("alertPriority", "NORMAL");
        result.put("message", "다음 경기 예정이에요");
        result.put("subMessage", "곧 경기 차례가 올 수 있어요. 준비하고 대기해 주세요.");
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> matchCall(Long sessionId, Long userId, String guestToken) {
        GroupSession session = session(sessionId);
        Participant participant = identify(session, userId, guestToken, Map.of());
        if (participant == null || participant.voteStatus() == null) throw new BusinessException(ErrorCode.FORBIDDEN);
        Map<String, Object> result = participantStatus(session, participant);
        result.put("alertType", "CALLING");
        result.put("alertPriority", "HIGH");
        result.put("message", "지금 경기 차례예요");
        result.put("subMessage", "코트로 이동해 주세요.");
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> currentMatch(Long sessionId, Long userId, String guestToken) {
        GroupSession session = session(sessionId);
        Participant participant = identify(session, userId, guestToken, Map.of());
        if (participant == null || participant.voteStatus() == null) throw new BusinessException(ErrorCode.FORBIDDEN);
        Map<String, Object> result = participantStatus(session, participant);
        result.put("message", "현재 경기중이에요");
        result.put("subMessage", "경기가 끝나면 결과를 입력해 주세요.");
        return result;
    }

    @Transactional
    public Map<String, Object> startCurrentMatch(Long sessionId, Long userId, String guestToken, Map<String, Object> body) {
        GroupSession session = session(sessionId);
        Participant participant = identify(session, userId, guestToken, Map.of());
        if (participant == null || participant.voteStatus() == null) throw new BusinessException(ErrorCode.FORBIDDEN);
        Long matchId = optionalLong(body, "matchId");
        if (matchId == null) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        GroupSessionAttendance entry = attendanceEntry(session, participant);
        sessionOperations.startParticipantMatch(sessionId, matchId, entry);
        events.session(session.getGroup().getId(), session.getId(), "PARTICIPANT_STATUS_UPDATED");
        return currentMatch(sessionId, userId, guestToken);
    }

    @Transactional
    public Map<String, Object> submitMatchResult(Long sessionId, Long userId, String guestToken, Map<String, Object> body) {
        GroupSession session = session(sessionId);
        Participant participant = identify(session, userId, guestToken, Map.of());
        if (participant == null || participant.voteStatus() == null) throw new BusinessException(ErrorCode.FORBIDDEN);

        Long matchId = longValue(body, "matchId");
        GroupSessionAttendance entry = attendanceEntry(session, participant);
        MatchRecord match = matchRecords.findByIdAndSessionId(matchId, sessionId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        MatchPlayer me = match.getPlayers().stream().filter(player -> player.getAttendance() != null && player.getAttendance().getId().equals(entry.getId()))
                .findFirst().orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN));
        String result = text(body, "result");
        if (!result.equals("WIN") && !result.equals("LOSS")) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        int myScore = optionalInteger(body, "myScore", result.equals("WIN") ? 1 : 0);
        int opponentScore = optionalInteger(body, "opponentScore", result.equals("WIN") ? 0 : 1);
        boolean scoreEntered = body.get("myScore") != null && body.get("opponentScore") != null;
        Map<String, Object> operationBody = me.getTeamNumber() == 1
                ? Map.of("teamAScore", myScore, "teamBScore", opponentScore, "scoreEntered", scoreEntered)
                : Map.of("teamAScore", opponentScore, "teamBScore", myScore, "scoreEntered", scoreEntered);
        Map<String, Object> response = sessionOperations.submitParticipantResult(sessionId, matchId, entry, operationBody);
        response.put("submitted", !Boolean.TRUE.equals(response.get("resultAlreadySubmitted")));
        response.put("submittedMatchId", matchId);
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> myReport(Long sessionId, Long userId, String guestToken) {
        GroupSession session = session(sessionId);
        Participant participant = identify(session, userId, guestToken, Map.of());
        if (participant == null || participant.voteStatus() == null) throw new BusinessException(ErrorCode.FORBIDDEN);

        Map<String, Object> result = sessionMap(session);
        putParticipant(session, result, participant);
        boolean guest = participant.guest() != null;
        result.put("guestRecordLimited", guest && session.getStatus() != GroupSessionStatus.CLOSED);
        result.put("canOpenFullRecord", userId != null && isOperator(session, userId));

        GroupSessionAttendance attendance = attendanceEntry(session, participant);
        Map<String, Object> report = sessionOperations.participantReport(sessionId, attendance);
        result.put("summary", report.get("summary"));
        result.put("matches", report.get("matches"));
        return result;
    }

    private boolean isOperator(GroupSession session, Long userId) {
        User user = users.findById(userId).orElse(null);
        if (user != null && user.getRole() == UserRole.ADMIN) return true;
        return members.findByGroupIdAndUserIdAndStatus(session.getGroup().getId(), userId, GroupMemberStatus.ACTIVE)
                .map(member -> member.getRole() != GroupMemberRole.MEMBER)
                .orElse(false);
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

    private Map<String, Object> participantStatus(GroupSession session, Participant participant) {
        Map<String, Object> result = sessionMap(session);
        putParticipant(session, result, participant);

        GroupSessionAttendance attendance = participant.member() != null
                ? attendanceEntries.findBySessionIdAndMemberId(session.getId(), participant.member().getId()).orElse(null)
                : attendanceEntries.findBySessionIdAndGuestId(session.getId(), participant.guest().getId()).orElse(null);

        SessionPlayStatus playStatus = attendance == null || attendance.getPlayStatus() == null ? SessionPlayStatus.WAITING : attendance.getPlayStatus();
        Map<String, Object> todayStats = new LinkedHashMap<>();
        todayStats.put("games", 0);
        todayStats.put("wins", 0);
        todayStats.put("losses", 0);
        todayStats.put("pointsFor", 0);
        todayStats.put("pointsAgainst", 0);
        todayStats.put("doublesMmrDelta", 0);
        todayStats.put("mixedMmrDelta", 0);

        if (attendance != null) {
            Map<String, Object> report = sessionOperations.participantReport(session.getId(), attendance);
            Object summary = report.get("summary");
            if (summary instanceof Map<?, ?> values) {
                for (String key : List.of("games", "wins", "losses", "pointsFor", "pointsAgainst", "doublesMmrDelta", "mixedMmrDelta")) {
                    if (values.containsKey(key)) todayStats.put(key, values.get(key));
                }
            }
        }

        result.put("playStatus", playStatus);
        result.put("gameStatus", playStatus);
        Map<String, Object> operation = attendance == null ? Map.of() : sessionOperations.participantMatch(session.getId(), attendance);
        Object nextMatch = operation.get("nextMatch");
        Object currentMatch = operation.get("currentMatch");
        result.put("nextMatch", nextMatch);
        result.put("currentMatch", currentMatch);
        if (playStatus == SessionPlayStatus.CALLING || playStatus == SessionPlayStatus.NEXT_UP) {
            Map<String, Object> prompt = new LinkedHashMap<>();
            prompt.put("type", playStatus == SessionPlayStatus.CALLING ? "CALLING" : "NEXT_UP");
            prompt.put("priority", playStatus == SessionPlayStatus.CALLING ? "HIGH" : "NORMAL");
            if (nextMatch instanceof Map<?, ?> values) {
                prompt.put("matchQueueId", values.get("matchQueueId"));
                prompt.put("matchId", values.get("matchId"));
            }
            result.put("nextPrompt", prompt);
        } else result.put("nextPrompt", null);
        result.put("todayStats", todayStats);
        result.put("lastUpdatedAt", LocalDateTime.now());
        result.put("realtimeConnected", true);
        result.put("guestRecordLimited", participant.guest() != null);
        return result;
    }

    private Map<String, Object> matchMap(MatchPlayer player, int myScore, int opponentScore, boolean win) {
        MatchRecord match = player.getMatch();
        List<String> opponents = match.getPlayers().stream()
                .filter(item -> item.getTeamNumber() != player.getTeamNumber())
                .map(MatchPlayer::displayName)
                .toList();
        String partner = match.getPlayers().stream()
                .filter(item -> item.getTeamNumber() == player.getTeamNumber())
                .filter(item -> item.getId() == null || !item.getId().equals(player.getId()))
                .map(MatchPlayer::displayName)
                .findFirst().orElse(null);

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("matchId", match.getId());
        map.put("court", match.getCourtNumber());
        map.put("matchType", match.getMatchType().name());
        map.put("partner", partner);
        map.put("opponents", opponents);
        map.put("myScore", myScore);
        map.put("opponentScore", opponentScore);
        map.put("result", win ? "WIN" : "LOSS");
        map.put("status", match.isResultUpdated() ? "RESULT_UPDATED" : "RESULT_ENTERED");
        map.put("mmrType", match.getMatchType() == com.shuttleplay.server.domain.record.enums.MatchType.MIXED_DOUBLES ? "MIXED" : "DOUBLES");
        map.put("mmrBefore", player.getMmrBefore());
        map.put("mmrAfter", player.getMmrAfter());
        map.put("mmrDelta", player.getMmrDelta() == null ? 0 : player.getMmrDelta());
        map.put("completedAt", match.getEndedAt());
        map.put("resultUpdated", match.isResultUpdated());
        return map;
    }

    private void putParticipant(GroupSession session, Map<String, Object> map, Participant participant) {
        map.put("registered", participant != null && participant.voteStatus() != null);
        if (participant == null) { map.put("participantType", "UNKNOWN"); return; }
        map.put("participantType", participant.member() != null ? "MEMBER" : "GUEST");
        map.put("name", participant.member() != null ? participant.member().getUser().getName() : participant.guest().getName());
        map.put("grade", participant.member() != null ? participant.member().getUser().getGrade() : participant.guest().getGrade());
        map.put("gender", participant.member() != null ? participant.member().getUser().getGender() : participant.guest().getGender());
        map.put("ageGroup", participant.member() != null ? participant.member().getUser().getAgeGroup() : participant.guest().getAgeGroup());
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
        String targetPath = "/groups/" + PublicIdCodec.encode(session.getGroup().getId()) + "/schedule";
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
    private static int optionalInteger(Map<String, Object> body, String key, int fallback) {
        Object value = body.get(key);
        if (value == null || String.valueOf(value).isBlank()) return fallback;
        try { return Integer.parseInt(String.valueOf(value)); } catch (RuntimeException exception) { throw new BusinessException(ErrorCode.INVALID_REQUEST); }
    }
    private static Long longValue(Map<String, Object> body, String key) { try { return Long.valueOf(String.valueOf(body.get(key))); } catch (RuntimeException exception) { throw new BusinessException(ErrorCode.INVALID_REQUEST); } }
    private static Long optionalLong(Map<String, Object> body, String key) {
        if (body == null) return null;
        Object value = body.get(key);
        if (value == null || String.valueOf(value).isBlank()) return null;
        try { return Long.valueOf(String.valueOf(value)); } catch (RuntimeException exception) { throw new BusinessException(ErrorCode.INVALID_REQUEST); }
    }
    private static <T extends Enum<T>> T enumValue(Class<T> type, String value) { try { return Enum.valueOf(type, value); } catch (RuntimeException exception) { throw new BusinessException(ErrorCode.INVALID_REQUEST); } }
}
