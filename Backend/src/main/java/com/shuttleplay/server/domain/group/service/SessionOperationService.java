package com.shuttleplay.server.domain.group.service;

import com.shuttleplay.server.domain.group.entity.*;
import com.shuttleplay.server.domain.group.enums.*;
import com.shuttleplay.server.domain.group.repository.*;
import com.shuttleplay.server.domain.notification.enums.NotificationPreferenceType;
import com.shuttleplay.server.domain.notification.enums.NotificationType;
import com.shuttleplay.server.domain.notification.service.NotificationService;
import com.shuttleplay.server.domain.record.entity.*;
import com.shuttleplay.server.domain.record.enums.*;
import com.shuttleplay.server.domain.record.repository.*;
import com.shuttleplay.server.domain.record.service.MmrCalculationPolicy;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.enums.Gender;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import com.shuttleplay.server.global.util.PublicIdCodec;
import java.time.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SessionOperationService {
    private static final List<SessionQueueStatus> ACTIVE_QUEUE = List.of(SessionQueueStatus.WAITING, SessionQueueStatus.CALLING);
    private static final List<MatchOperationStatus> ACTIVE_MATCH = List.of(MatchOperationStatus.CALLING, MatchOperationStatus.PLAYING);

    private final GroupSessionRepository sessions;
    private final GroupSessionAttendanceRepository attendances;
    private final SessionMatchQueueRepository queues;
    private final SessionParticipantRelationRepository relations;
    private final GroupSessionVoteRepository votes;
    private final GroupSessionGuestRepository guests;
    private final MatchRecordRepository matches;
    private final MatchPlayerRepository matchPlayers;
    private final MmrHistoryRepository mmrHistories;
    private final MatchResultRevisionRepository resultRevisions;
    private final DailyRecordRepository dailyRecords;
    private final GroupAccessService access;
    private final GroupEventService events;
    private final NotificationService notifications;
    private final MmrCalculationPolicy mmrPolicy;
    private final MatchingScorePolicy matchingPolicy;

    private record Candidate(List<GroupSessionAttendance> teamA, List<GroupSessionAttendance> teamB,
                             double score, List<String> explanations, int forcedCount, int longRestCount,
                             int blockedCount, long maxProjectedLoad, long totalProjectedLoad,
                             double teamMmrGap, int partnerDuplicates, long totalGames) {}
    private record ResultScores(int teamA, int teamB, boolean scoreEntered) {}

    @Transactional
    public Map<String, Object> dashboard(Long userId, Long sessionId) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        synchronizeParticipantRoster(session);
        List<GroupSessionAttendance> participants = attendances.findAllBySessionIdOrderByIdAsc(sessionId);
        List<MatchRecord> current = currentMatches(sessionId);
        List<SessionMatchQueue> queue = activeQueues(sessionId);
        List<MatchRecord> allMatches = matches.findAllBySessionIdAndIsDeletedFalseOrderByPlayedAtAsc(sessionId);
        Map<Long, Long> gameCounts = completedGameCounts(sessionId);

        Map<String, Object> result = sessionMap(session);
        result.put("summary", summary(participants, current, queue, allMatches));
        result.put("currentMatches", current.stream().map(this::matchMap).toList());
        result.put("queues", queue.stream().filter(item -> item.getStatus() == SessionQueueStatus.WAITING).limit(Math.max(1, session.getCourtCount())).map(this::queueMap).toList());
        result.put("pendingResults", allMatches.stream().filter(match -> match.getOperationStatus() == MatchOperationStatus.PLAYING).map(this::matchMap).toList());
        result.put("participants", participants.stream().map(item -> participantMap(item, gameCounts.getOrDefault(item.getId(), 0L))).toList());
        result.put("alerts", alerts(session, participants, current, queue));
        result.put("lastUpdatedAt", LocalDateTime.now());
        return result;
    }

    @Transactional
    public Map<String, Object> participants(Long userId, Long sessionId) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        synchronizeParticipantRoster(session);
        List<GroupSessionAttendance> entries = attendances.findAllBySessionIdOrderByIdAsc(sessionId);
        Map<Long, Long> gameCounts = completedGameCounts(sessionId);
        Map<String, Object> result = sessionMap(session);
        result.put("participants", entries.stream().map(entry -> participantMap(entry, gameCounts.getOrDefault(entry.getId(), 0L))).toList());
        result.put("relations", relations.findAllBySessionIdAndIsDeletedFalseOrderByIdAsc(sessionId).stream().map(this::relationMap).toList());
        return result;
    }

    @Transactional
    public Map<String, Object> changeParticipantStatus(Long userId, Long sessionId, Long attendanceId, Map<String, Object> body) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        GroupSessionAttendance attendance = attendance(sessionId, attendanceId);
        SessionPlayStatus next = enumValue(SessionPlayStatus.class, body.get("playStatus"), SessionPlayStatus.AVAILABLE);
        attendance.overridePlayStatus(next);
        autoAssignEmptyCourts(session);
        publish(session, "PARTICIPANT_STATUS_UPDATED");
        return participantMap(attendance, completedGameCount(attendanceId));
    }

    @Transactional
    public Map<String, Object> changeParticipantAttendance(Long userId, Long sessionId, Long attendanceId, Map<String, Object> body) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        GroupSessionAttendance attendance = attendance(sessionId, attendanceId);
        SessionAttendanceStatus status = enumValue(SessionAttendanceStatus.class, body.get("attendanceStatus"), attendance.getStatus());
        if (attendance.getStatus() == SessionAttendanceStatus.ARRIVED && status != SessionAttendanceStatus.ARRIVED) throw new BusinessException(ErrorCode.CONFLICT);
        try {
            switch (status) {
                case ARRIVED -> attendance.arrive();
                case LATE -> {
                    LocalDateTime expectedAt = LocalDateTime.parse(string(body.get("expectedArrivalAt")));
                    attendance.late(expectedAt, string(body.get("lateReason")));
                }
                case ABSENT -> attendance.absent();
                case REGISTERED -> attendance.register();
            }
        } catch (RuntimeException exception) { throw new BusinessException(ErrorCode.INVALID_REQUEST); }
        if (attendance.getMember() != null) votes.findBySessionIdAndMemberId(sessionId, attendance.getMember().getId()).ifPresent(vote -> {
            if (status == SessionAttendanceStatus.ABSENT) vote.updateStatus(SessionVoteStatus.ABSENT);
            else if (vote.getStatus() == SessionVoteStatus.ABSENT) vote.updateStatus(SessionVoteStatus.ATTENDING);
        });
        else if (attendance.getGuest() != null) attendance.getGuest().updateStatus(status == SessionAttendanceStatus.ABSENT ? SessionVoteStatus.ABSENT : SessionVoteStatus.ATTENDING);
        autoAssignEmptyCourts(session);
        publish(session, "PARTICIPANT_STATUS_UPDATED");
        return participantMap(attendance, completedGameCount(attendanceId));
    }

    @Transactional
    public void reconcileParticipantAvailability(Long sessionId) {
        GroupSession session = session(sessionId);
        refreshNextWindow(session);
        autoAssignEmptyCourts(session);
        publish(session, "PARTICIPANT_STATUS_UPDATED");
    }

    private void synchronizeParticipantRoster(GroupSession session) {
        votes.findAllBySessionId(session.getId()).forEach(vote -> {
            GroupSessionAttendance attendance = attendances.findBySessionIdAndMemberId(session.getId(), vote.getMember().getId())
                    .orElseGet(() -> attendances.save(GroupSessionAttendance.forMember(session, vote.getMember())));
            if (vote.getStatus() == SessionVoteStatus.ABSENT && attendance.getStatus() == SessionAttendanceStatus.REGISTERED) attendance.absent();
            else if (vote.getStatus() != SessionVoteStatus.ABSENT && attendance.getStatus() == SessionAttendanceStatus.ABSENT) attendance.register();
        });
        guests.findAllBySessionId(session.getId()).forEach(guest -> {
            GroupSessionAttendance attendance = attendances.findBySessionIdAndGuestId(session.getId(), guest.getId())
                    .orElseGet(() -> attendances.save(GroupSessionAttendance.forGuest(session, guest)));
            if (guest.getStatus() == SessionVoteStatus.ABSENT && attendance.getStatus() == SessionAttendanceStatus.REGISTERED) attendance.absent();
            else if (guest.getStatus() != SessionVoteStatus.ABSENT && attendance.getStatus() == SessionAttendanceStatus.ABSENT) attendance.register();
        });
    }

    @Transactional
    public Map<String, Object> updateParticipantMemo(Long userId, Long sessionId, Long attendanceId, Map<String, Object> body) {
        operatorOperationSession(userId, sessionId);
        GroupSessionAttendance attendance = attendance(sessionId, attendanceId);
        attendance.updateOperatorMemo(string(body.get("memo")));
        return participantMap(attendance, completedGameCount(attendanceId));
    }

    @Transactional
    public Map<String, Object> updateCourts(Long userId, Long sessionId, Map<String, Object> body) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        Set<Integer> disabled = longSet(body.get("disabledCourtNumbers")).stream().map(Long::intValue).collect(Collectors.toSet());
        if (currentMatches(sessionId).stream().anyMatch(match -> disabled.contains(match.getCourtNumber()))) throw new BusinessException(ErrorCode.CONFLICT);
        try { session.updateDisabledCourts(disabled); }
        catch (IllegalArgumentException exception) { throw new BusinessException(ErrorCode.INVALID_REQUEST); }
        autoAssignEmptyCourts(session);
        publish(session, "COURT_STATUS_UPDATED");
        return sessionMap(session);
    }

    @Transactional
    public Map<String, Object> saveRelation(Long userId, Long sessionId, Map<String, Object> body) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        GroupSessionAttendance first = attendance(sessionId, longValue(body, "firstAttendanceId"));
        GroupSessionAttendance second = attendance(sessionId, longValue(body, "secondAttendanceId"));
        if (first.getId().equals(second.getId())) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        ParticipantRelationType type = enumValue(ParticipantRelationType.class, body.get("relationType"), ParticipantRelationType.TEAM_AVOID);
        SessionParticipantRelation relation = relations.findAllBySessionIdAndIsDeletedFalseOrderByIdAsc(sessionId).stream()
                .filter(item -> samePair(item, first, second) && item.getRelationType() == type).findFirst()
                .orElseGet(() -> relations.save(SessionParticipantRelation.create(session, first, second, type)));
        publish(session, "PARTICIPANT_RELATION_UPDATED");
        return relationMap(relation);
    }

    @Transactional
    public void deleteRelation(Long userId, Long sessionId, Long relationId) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        SessionParticipantRelation relation = relations.findById(relationId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        if (!relation.getSession().getId().equals(sessionId)) throw new BusinessException(ErrorCode.NOT_FOUND);
        relations.delete(relation);
        publish(session, "PARTICIPANT_RELATION_UPDATED");
    }

    @Transactional
    public Map<String, Object> generate(Long userId, Long sessionId, Map<String, Object> body) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        session.startOperation();
        MatchType type = enumValue(MatchType.class, body.get("matchType"), MatchType.ANY);
        PlayStyle style = enumValue(PlayStyle.class, body.get("playStyle"), PlayStyle.FUN);
        int requestedValue = intValue(body.get("courtCount"), intValue(body.get("count"), session.getCourtCount()));
        int requested = Math.max(1, Math.min(requestedValue, session.getCourtCount()));
        Set<Long> excluded = longSet(body.containsKey("excludedParticipantIds") ? body.get("excludedParticipantIds") : body.get("excludedAttendanceIds"));
        Set<Long> forced = longSet(body.containsKey("forcedParticipantIds") ? body.get("forcedParticipantIds") : body.get("forcedAttendanceIds"));

        if (body.containsKey("preservedQueueIds")) {
            Set<Long> preserved = longSet(body.get("preservedQueueIds"));
            activeQueues(sessionId).stream().filter(queue -> queue.getStatus() == SessionQueueStatus.WAITING)
                    .filter(queue -> !preserved.contains(queue.getId())).forEach(queue -> {
                        queue.cancel();
                    });
        }

        List<GroupSessionAttendance> eligible = attendances.findAllBySessionIdOrderByIdAsc(sessionId).stream()
                .filter(item -> item.getStatus() == SessionAttendanceStatus.ARRIVED)
                .filter(item -> item.getPlayStatus() != SessionPlayStatus.RESTING
                        && item.getPlayStatus() != SessionPlayStatus.LEFT && item.getPlayStatus() != SessionPlayStatus.ABSENT)
                .filter(item -> !excluded.contains(item.getId()))
                .toList();
        Map<Long, Long> gameCounts = completedGameCounts(sessionId);
        eligible = eligible.stream()
                .sorted(Comparator.comparing((GroupSessionAttendance item) -> !forced.contains(item.getId()))
                        .thenComparing(Comparator.comparingInt(GroupSessionAttendance::getConsecutiveRestCount).reversed())
                        .thenComparingLong(item -> gameCounts.getOrDefault(item.getId(), 0L)))
                .toList();
        if (eligible.size() < 4) {
            refreshNextWindow(session);
            return Map.of("generatedCount", 0, "queues", List.of(), "lowQuality", false,
                    "message", "경기 가능한 참가자가 4명 이상 모이면 후보를 만들어요.");
        }

        List<SessionParticipantRelation> relationList = relations.findAllBySessionIdAndIsDeletedFalseOrderByIdAsc(sessionId);
        Map<String, Integer> partnerHistory = pairHistory(sessionId, true);
        Map<String, Integer> opponentHistory = pairHistory(sessionId, false);
        Map<Long, Long> scheduledCounts = scheduledCounts(sessionId);
        List<Candidate> candidates = candidates(eligible, type, style, relationList, partnerHistory, opponentHistory, gameCounts, scheduledCounts, forced, false);
        if (candidates.isEmpty()) candidates = candidates(eligible, type, style, relationList, partnerHistory, opponentHistory, gameCounts, scheduledCounts, forced, true);
        candidates.sort(Comparator.comparingInt(Candidate::forcedCount).reversed()
                .thenComparingLong(Candidate::maxProjectedLoad)
                .thenComparingLong(Candidate::totalProjectedLoad)
                .thenComparingInt(Candidate::blockedCount)
                .thenComparing(Comparator.comparingInt(Candidate::longRestCount).reversed())
                .thenComparing(Comparator.comparingDouble(Candidate::score).reversed())
                .thenComparingDouble(Candidate::teamMmrGap)
                .thenComparingInt(Candidate::partnerDuplicates)
                .thenComparingLong(Candidate::totalGames));

        Set<Long> selectedIds = new HashSet<>();
        List<Candidate> selected = new ArrayList<>();
        for (Candidate candidate : candidates) {
            Set<Long> ids = candidatePlayers(candidate).stream().map(GroupSessionAttendance::getId).collect(Collectors.toSet());
            if (ids.stream().anyMatch(selectedIds::contains)) continue;
            selected.add(candidate); selectedIds.addAll(ids);
            if (selected.size() == requested) break;
        }
        if (selected.isEmpty()) return Map.of("generatedCount", 0, "queues", List.of(), "lowQuality", false,
                "message", "현재 조건에서 만들 수 있는 후보가 없어요. 참가자 상태를 확인해 주세요.");

        int nextOrder = activeQueues(sessionId).stream().mapToInt(SessionMatchQueue::getQueueOrder).max().orElse(0) + 1;
        List<SessionMatchQueue> created = new ArrayList<>();
        for (Candidate candidate : selected) {
            SessionMatchQueue queue = SessionMatchQueue.create(session, nextOrder++, type, style, candidate.score(), candidate.explanations());
            for (int index = 0; index < 2; index++) queue.addPlayer(candidate.teamA().get(index), 1, index + 1);
            for (int index = 0; index < 2; index++) queue.addPlayer(candidate.teamB().get(index), 2, index + 1);
            created.add(queues.save(queue));
        }
        refreshNextWindow(session);
        autoAssignEmptyCourts(session);
        publish(session, "MATCH_QUEUE_UPDATED");
        boolean lowQuality = selected.stream().anyMatch(candidate -> candidate.score() < 50);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("generatedCount", created.size());
        result.put("queues", created.stream().map(this::queueMap).toList());
        result.put("lowQuality", lowQuality);
        result.put("message", lowQuality ? "가능한 최선의 후보를 만들었지만 일부 조합의 균형을 확인해 주세요." : "경기 후보를 만들었어요.");
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> queues(Long userId, Long sessionId) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        Map<String, Object> result = sessionMap(session);
        result.put("queues", activeQueues(sessionId).stream().filter(queue -> queue.getStatus() == SessionQueueStatus.WAITING).map(this::queueMap).toList());
        result.put("hasMatchHistory", hasMatchHistory(sessionId));
        result.put("relations", relations.findAllBySessionIdAndIsDeletedFalseOrderByIdAsc(sessionId).stream().map(this::relationMap).toList());
        Map<Long, Long> gameCounts = completedGameCounts(sessionId);
        result.put("participants", attendances.findAllBySessionIdOrderByIdAsc(sessionId).stream()
                .filter(item -> item.getStatus() == SessionAttendanceStatus.ARRIVED && item.getPlayStatus() != SessionPlayStatus.RESTING
                        && item.getPlayStatus() != SessionPlayStatus.LEFT && item.getPlayStatus() != SessionPlayStatus.ABSENT)
                .map(item -> participantMap(item, gameCounts.getOrDefault(item.getId(), 0L))).toList());
        return result;
    }

    @Transactional
    public Map<String, Object> updateQueue(Long userId, Long sessionId, Long queueId, Map<String, Object> body) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        SessionMatchQueue queue = queue(sessionId, queueId);
        if (queue.getStatus() != SessionQueueStatus.WAITING) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        List<Long> teamAIds = teamIds(body, "teamAIds");
        List<Long> teamBIds = teamIds(body, "teamBIds");
        Set<Long> unique = new HashSet<>(); unique.addAll(teamAIds); unique.addAll(teamBIds);
        if (teamAIds.size() != 2 || teamBIds.size() != 2 || unique.size() != 4) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        List<GroupSessionAttendance> teamA = teamAIds.stream().map(id -> attendance(sessionId, id)).toList();
        List<GroupSessionAttendance> teamB = teamBIds.stream().map(id -> attendance(sessionId, id)).toList();
        if (candidatePlayers(teamA, teamB).stream().anyMatch(item -> item.getStatus() != SessionAttendanceStatus.ARRIVED
                || item.getPlayStatus() == SessionPlayStatus.RESTING || item.getPlayStatus() == SessionPlayStatus.LEFT
                || item.getPlayStatus() == SessionPlayStatus.ABSENT)) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        validateMatchType(queue.getMatchType(), teamA, teamB);
        queue.replacePlayers(teamA, teamB);
        refreshNextWindow(session);
        autoAssignEmptyCourts(session);
        publish(session, "MATCH_QUEUE_UPDATED");
        return queueMap(queue);
    }

    @Transactional
    public Map<String, Object> callQueue(Long userId, Long sessionId, Long queueId, Map<String, Object> body) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        session = lockedSession(sessionId);
        SessionMatchQueue requestedQueue = queue(sessionId, queueId);
        int court = intValue(body.get("courtNumber"), firstFreeCourt(session));
        if (court < 1 || court > session.getCourtCount() || session.disabledCourtNumbers().contains(court) || matches.existsBySessionIdAndCourtNumberAndOperationStatusIn(sessionId, court, ACTIVE_MATCH)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        SessionMatchQueue callableQueue = requestedQueue.getStatus() == SessionQueueStatus.WAITING
                && requestedQueue.getPlayers().stream().noneMatch(player -> unavailableForCall(player.getAttendance()))
                ? requestedQueue
                : activeQueues(sessionId).stream().filter(queue -> queue.getStatus() == SessionQueueStatus.WAITING)
                        .filter(queue -> queue.getPlayers().stream().noneMatch(player -> unavailableForCall(player.getAttendance())))
                        .findFirst().orElseThrow(() -> new BusinessException(ErrorCode.CONFLICT));
        return matchMap(call(session, callableQueue, court));
    }

    @Transactional
    public Map<String, Object> assignEmptyCourts(Long userId, Long sessionId) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        List<MatchRecord> assigned = assignToEmptyCourts(session, Set.of());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("assignedCount", assigned.size());
        result.put("matches", assigned.stream().map(this::matchMap).toList());
        result.put("message", assigned.isEmpty() ? "지금 배정할 수 있는 빈 코트나 경기 후보가 없어요."
                : assigned.size() + "개 경기를 빈 코트에 배정했어요.");
        if (!assigned.isEmpty()) publish(session, "MATCH_QUEUE_UPDATED");
        return result;
    }

    @Transactional
    public Map<String, Object> createManualQueue(Long userId, Long sessionId, Map<String, Object> body) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        session.startOperation();
        List<Long> teamAIds = teamIds(body, "teamAIds");
        List<Long> teamBIds = teamIds(body, "teamBIds");
        Set<Long> unique = new HashSet<>(); unique.addAll(teamAIds); unique.addAll(teamBIds);
        if (teamAIds.size() != 2 || teamBIds.size() != 2 || unique.size() != 4) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        List<GroupSessionAttendance> teamA = teamAIds.stream().map(id -> attendance(sessionId, id)).toList();
        List<GroupSessionAttendance> teamB = teamBIds.stream().map(id -> attendance(sessionId, id)).toList();
        List<GroupSessionAttendance> selected = candidatePlayers(teamA, teamB);
        if (selected.stream().anyMatch(item -> item.getStatus() != SessionAttendanceStatus.ARRIVED
                || item.getPlayStatus() == SessionPlayStatus.RESTING || item.getPlayStatus() == SessionPlayStatus.LEFT
                || item.getPlayStatus() == SessionPlayStatus.ABSENT)) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        MatchType type = enumValue(MatchType.class, body.get("matchType"), MatchType.ANY);
        PlayStyle style = enumValue(PlayStyle.class, body.get("playStyle"), PlayStyle.FUN);
        validateMatchType(type, teamA, teamB);
        int order = activeQueues(sessionId).stream().mapToInt(SessionMatchQueue::getQueueOrder).max().orElse(0) + 1;
        SessionMatchQueue queue = SessionMatchQueue.create(session, order, type, style, 100, List.of("운영자가 직접 구성한 경기예요."));
        for (int i = 0; i < 2; i++) queue.addPlayer(teamA.get(i), 1, i + 1);
        for (int i = 0; i < 2; i++) queue.addPlayer(teamB.get(i), 2, i + 1);
        queues.save(queue);
        refreshNextWindow(session);
        autoAssignEmptyCourts(session);
        publish(session, "MATCH_QUEUE_UPDATED");
        return queueMap(queue);
    }

    @Transactional
    public void cancelQueue(Long userId, Long sessionId, Long queueId) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        SessionMatchQueue queue = queue(sessionId, queueId);
        queue.cancel();
        refreshNextWindow(session);
        autoAssignEmptyCourts(session);
        publish(session, "MATCH_QUEUE_UPDATED");
    }

    @Transactional
    public Map<String, Object> reorderQueue(Long userId, Long sessionId, Long queueId, Map<String, Object> body) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        SessionMatchQueue queue = queue(sessionId, queueId);
        List<SessionMatchQueue> ordered = new ArrayList<>(activeQueues(sessionId));
        ordered.removeIf(item -> item.getId().equals(queueId));
        int target = Math.max(1, Math.min(intValue(body.get("queueOrder"), queue.getQueueOrder()), ordered.size() + 1));
        ordered.add(target - 1, queue);
        for (int index = 0; index < ordered.size(); index++) ordered.get(index).reorder(index + 1);
        refreshNextWindow(session);
        autoAssignEmptyCourts(session);
        publish(session, "MATCH_QUEUE_UPDATED");
        return queueMap(queue);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> current(Long userId, Long sessionId) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        Map<String, Object> result = sessionMap(session);
        result.put("matches", currentMatches(sessionId).stream().map(this::matchMap).toList());
        result.put("queues", activeQueues(sessionId).stream().map(this::queueMap).toList());
        Map<Long, Long> gameCounts = completedGameCounts(sessionId);
        result.put("participants", attendances.findAllBySessionIdOrderByIdAsc(sessionId).stream()
                .filter(item -> item.getStatus() == SessionAttendanceStatus.ARRIVED && item.getPlayStatus() != SessionPlayStatus.PLAYING
                        && item.getPlayStatus() != SessionPlayStatus.CALLING && item.getPlayStatus() != SessionPlayStatus.LEFT && item.getPlayStatus() != SessionPlayStatus.ABSENT)
                .map(item -> participantMap(item, gameCounts.getOrDefault(item.getId(), 0L))).toList());
        return result;
    }

    @Transactional
    public Map<String, Object> startMatch(Long userId, Long sessionId, Long matchId) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        MatchRecord match = match(sessionId, matchId);
        start(match);
        publish(session, "MATCH_STARTED");
        return matchMap(match);
    }

    @Transactional
    public Map<String, Object> submitOperatorResult(Long userId, Long sessionId, Long matchId, Map<String, Object> body) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        return submitResult(session, matchId, body, false);
    }

    @Transactional
    public Map<String, Object> updateResult(Long userId, Long sessionId, Long matchId, Map<String, Object> body) {
        GroupSession session = operatorSession(userId, sessionId);
        String reason = string(body.get("reason"));
        if (reason.isBlank()) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        MatchRecord match = matches.findLockedByIdAndSessionId(matchId, sessionId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        if (match.getOperationStatus() != MatchOperationStatus.RESULT_ENTERED) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        ResultScores scores = scores(body);
        User modifier = access.scheduleManager(session.getGroup().getId(), userId).getUser();
        resultRevisions.save(MatchResultRevision.create(match, modifier, scores.teamA(), scores.teamB(), scores.scoreEntered(), reason));
        match.updateResult(scores.teamA(), scores.teamB(), scores.scoreEntered(), reason);
        recalculateMmrFrom(match);
        publish(session, "MATCH_RESULT_UPDATED");
        return matchMap(match);
    }

    @Transactional
    public Map<String, Object> cancelMatch(Long userId, Long sessionId, Long matchId, Map<String, Object> body) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        MatchRecord match = matches.findLockedByIdAndSessionId(matchId, sessionId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        if (match.getOperationStatus() == MatchOperationStatus.RESULT_ENTERED) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        match.cancelOperation(string(body.get("reason")));
        if (match.getMatchQueue() != null) match.getMatchQueue().cancel();
        Set<Long> releasedAttendanceIds = match.getPlayers().stream().map(MatchPlayer::getAttendance).filter(Objects::nonNull)
                .map(GroupSessionAttendance::getId).collect(Collectors.toSet());
        match.getPlayers().forEach(player -> player.getAttendance().changePlayStatus(SessionPlayStatus.AVAILABLE));
        autoCallNext(session, match.getCourtNumber(), releasedAttendanceIds);
        publish(session, "MATCH_CANCELED");
        return matchMap(match);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> report(Long userId, Long sessionId) {
        GroupSession session = operatorSession(userId, sessionId);
        return reportMap(session);
    }

    @Transactional
    public Map<String, Object> resetMatches(Long userId, Long sessionId) {
        GroupSession session = operatorSession(userId, sessionId);
        List<MatchRecord> sessionMatches = matches.findAllBySessionIdAndIsDeletedFalseOrderByPlayedAtAsc(sessionId);
        Set<Long> sessionMatchIds = sessionMatches.stream().map(MatchRecord::getId).collect(Collectors.toSet());
        Set<Long> affectedAttendanceIds = sessionMatches.stream().flatMap(match -> match.getPlayers().stream())
                .map(MatchPlayer::getAttendance).filter(Objects::nonNull).map(GroupSessionAttendance::getId).collect(Collectors.toSet());
        Map<Long, User> affectedUsers = sessionMatches.stream().flatMap(match -> match.getPlayers().stream())
                .map(MatchPlayer::getUser).filter(Objects::nonNull).collect(Collectors.toMap(User::getId, Function.identity(), (left, right) -> left));
        LocalDateTime recalculateFrom = sessionMatches.stream().filter(match -> match.getOperationStatus() == MatchOperationStatus.RESULT_ENTERED)
                .map(MatchRecord::getPlayedAt).min(LocalDateTime::compareTo).orElse(null);
        List<MatchRecord> affectedMatches = new ArrayList<>();
        if (recalculateFrom != null) {
            for (MatchRecord candidate : matches.findAllByOperationStatusAndIsDeletedFalseOrderByPlayedAtAsc(MatchOperationStatus.RESULT_ENTERED)) {
                if (candidate.getPlayedAt().isBefore(recalculateFrom)) continue;
                boolean connected = sessionMatchIds.contains(candidate.getId())
                        || candidate.getPlayers().stream().map(MatchPlayer::getAttendance).filter(Objects::nonNull)
                        .anyMatch(attendance -> affectedAttendanceIds.contains(attendance.getId()))
                        || candidate.getPlayers().stream().map(MatchPlayer::getUser).filter(Objects::nonNull)
                        .anyMatch(user -> affectedUsers.containsKey(user.getId()));
                if (!connected) continue;
                affectedMatches.add(candidate);
                candidate.getPlayers().stream().map(MatchPlayer::getAttendance).filter(Objects::nonNull)
                        .map(GroupSessionAttendance::getId).forEach(affectedAttendanceIds::add);
                candidate.getPlayers().stream().map(MatchPlayer::getUser).filter(Objects::nonNull)
                        .forEach(user -> affectedUsers.putIfAbsent(user.getId(), user));
            }
        }
        List<MatchRecord> reverse = new ArrayList<>(affectedMatches);
        Collections.reverse(reverse);
        reverse.forEach(this::rollbackMmr);

        mmrHistories.deleteAllInBatch(mmrHistories.findAllByMatch_Session_Id(sessionId));
        resultRevisions.deleteAllInBatch(resultRevisions.findAllByMatch_Session_Id(sessionId));
        matchPlayers.deleteAllInBatch(matchPlayers.findAllByMatch_Session_IdAndMatch_IsDeletedFalse(sessionId));
        matches.deleteAllInBatch(sessionMatches);
        matches.flush();
        queues.deleteAll(queues.findAllBySessionIdOrderByQueueOrderAsc(sessionId));
        queues.flush();

        List<MatchRecord> remainingAffectedMatches = affectedMatches.stream()
                .filter(match -> !sessionMatchIds.contains(match.getId())).toList();
        remainingAffectedMatches.forEach(this::applyMmr);

        attendances.findAllBySessionIdOrderByIdAsc(sessionId).forEach(GroupSessionAttendance::resetOperationState);
        Set<LocalDate> affectedDates = affectedMatches.stream().map(match -> match.getPlayedAt().toLocalDate()).collect(Collectors.toSet());
        affectedDates.add(session.getStartsAt().toLocalDate());
        affectedUsers.values().forEach(user -> affectedDates.forEach(date -> refreshDailyRecord(user, date)));
        publish(session, "MATCH_HISTORY_RESET");
        publish(session, "MATCH_QUEUE_UPDATED");
        publish(session, "MMR_UPDATED");
        publish(session, "REPORT_UPDATED");
        remainingAffectedMatches.stream().map(MatchRecord::getSession)
                .filter(affectedSession -> !affectedSession.getId().equals(sessionId))
                .collect(Collectors.toMap(GroupSession::getId, Function.identity(), (left, right) -> left)).values()
                .forEach(affectedSession -> { publish(affectedSession, "MMR_UPDATED"); publish(affectedSession, "REPORT_UPDATED"); });
        return reportMap(session);
    }

    @Transactional
    public Map<String, Object> close(Long userId, Long sessionId) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        if (!currentMatches(sessionId).isEmpty()) throw new BusinessException(ErrorCode.CONFLICT);
        activeQueues(sessionId).stream().filter(queue -> queue.getStatus() == SessionQueueStatus.WAITING).forEach(queue -> {
            queue.cancel();
        });
        session.closeOperation();
        publish(session, "SESSION_OPERATION_CLOSED");
        return reportMap(session);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> display(Long userId, Long sessionId) {
        GroupSession session = operatorOperationSession(userId, sessionId);
        Map<String, Object> result = sessionMap(session);
        result.put("currentMatches", currentMatches(sessionId).stream().map(this::publicMatchMap).toList());
        result.put("nextMatches", nextWindowQueues(session).stream().filter(queue -> queue.getStatus() == SessionQueueStatus.WAITING)
                .map(this::publicQueueMap).toList());
        result.put("lastUpdatedAt", LocalDateTime.now());
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> participantMatch(Long sessionId, GroupSessionAttendance attendance) {
        Optional<MatchRecord> current = currentMatches(sessionId).stream().filter(match -> match.getPlayers().stream()
                .anyMatch(player -> player.getAttendance() != null && player.getAttendance().getId().equals(attendance.getId()))).findFirst();
        Optional<SessionMatchQueue> next = activeQueues(sessionId).stream().filter(queue -> queue.getPlayers().stream()
                .anyMatch(player -> player.getAttendance().getId().equals(attendance.getId()))).findFirst();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("currentMatch", current.map(match -> participantMatchMap(match, attendance)).orElse(null));
        result.put("nextMatch", next.map(queue -> participantQueueMap(queue, attendance)).orElse(null));
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> participantReport(Long sessionId, GroupSessionAttendance attendance) {
        List<MatchPlayer> players = matchPlayers.findAllByMatch_Session_Id(sessionId).stream()
                .filter(player -> player.getAttendance() != null && player.getAttendance().getId().equals(attendance.getId()))
                .filter(player -> player.getMatch().getOperationStatus() == MatchOperationStatus.RESULT_ENTERED)
                .toList();
        Map<String, Object> record = participantRecord(attendance, players);
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("games", record.get("games")); summary.put("wins", record.get("wins")); summary.put("losses", record.get("losses"));
        summary.put("winRate", record.get("winRate")); summary.put("pointsFor", record.get("pointsFor")); summary.put("pointsAgainst", record.get("pointsAgainst"));
        summary.put("doublesMmrDelta", players.stream().filter(player -> player.getUsedMmrType() != MmrType.MIXED).mapToInt(player -> player.getMmrDelta() == null ? 0 : player.getMmrDelta()).sum());
        summary.put("mixedMmrDelta", players.stream().filter(player -> player.getUsedMmrType() == MmrType.MIXED).mapToInt(player -> player.getMmrDelta() == null ? 0 : player.getMmrDelta()).sum());
        return Map.of("summary", summary, "matches", players.stream().map(this::participantRecordMatch).toList());
    }

    @Transactional
    public Map<String, Object> startParticipantMatch(Long sessionId, Long matchId, GroupSessionAttendance attendance) {
        MatchRecord match = matches.findByIdAndSessionId(matchId, sessionId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        boolean participant = match.getPlayers().stream().anyMatch(player -> player.getAttendance() != null && player.getAttendance().getId().equals(attendance.getId()));
        if (!participant) throw new BusinessException(ErrorCode.FORBIDDEN);
        start(match);
        publish(match.getSession(), "MATCH_STARTED");
        return publicMatchMap(match);
    }

    @Transactional
    public Map<String, Object> submitParticipantResult(Long sessionId, Long matchId, GroupSessionAttendance attendance, Map<String, Object> body) {
        MatchRecord match = matches.findByIdAndSessionId(matchId, sessionId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        boolean participant = match.getPlayers().stream().anyMatch(player -> player.getAttendance() != null && player.getAttendance().getId().equals(attendance.getId()));
        if (!participant) throw new BusinessException(ErrorCode.FORBIDDEN);
        return submitResult(match.getSession(), matchId, body, true);
    }

    @Scheduled(fixedDelay = 15000)
    @Transactional
    public void autoStartCalledMatches() {
        for (MatchRecord match : matches.findAllByOperationStatusAndCalledAtBeforeAndIsDeletedFalse(
                MatchOperationStatus.CALLING, LocalDateTime.now().minusMinutes(2))) {
            start(match);
            publish(match.getSession(), "MATCH_STARTED");
        }
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void reconcileEmptyCourtAssignments() {
        LocalDateTime now = LocalDateTime.now();
        sessions.findAllByStartsAtBetweenAndStatusInAndIsDeletedFalse(
                now.minusHours(12), now.plusHours(12), List.of(GroupSessionStatus.ATTENDANCE_OPEN, GroupSessionStatus.IN_PROGRESS))
                .stream()
                .filter(session -> !activeQueues(session.getId()).isEmpty())
                .filter(this::hasFreeCourt)
                .forEach(this::autoAssignEmptyCourts);
    }

    private Map<String, Object> submitResult(GroupSession session, Long matchId, Map<String, Object> body, boolean participant) {
        MatchRecord match = matches.findLockedByIdAndSessionId(matchId, session.getId()).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        if (match.getOperationStatus() == MatchOperationStatus.RESULT_ENTERED) {
            Map<String, Object> result = matchMap(match); result.put("resultAlreadySubmitted", true); return result;
        }
        if (match.getOperationStatus() != MatchOperationStatus.PLAYING) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        ResultScores scores = scores(body);
        match.confirmResult(scores.teamA(), scores.teamB(), scores.scoreEntered());
        for (GroupSessionAttendance attendance : attendances.findAllBySessionIdOrderByIdAsc(session.getId())) {
            boolean played = match.getPlayers().stream().anyMatch(player -> player.getAttendance() != null && player.getAttendance().getId().equals(attendance.getId()));
            if (played) attendance.finishPlaying(); else attendance.countRest();
        }
        applyMmr(match);
        refreshDailyRecords(session);
        Set<Long> completedAttendanceIds = match.getPlayers().stream().map(MatchPlayer::getAttendance).filter(Objects::nonNull)
                .map(GroupSessionAttendance::getId).collect(Collectors.toSet());
        autoCallNext(session, match.getCourtNumber(), completedAttendanceIds);
        publish(session, "MATCH_COMPLETED");
        publish(session, "MATCH_RESULT_UPDATED");
        publish(session, "MMR_UPDATED");
        publish(session, "REPORT_UPDATED");
        Map<String, Object> result = matchMap(match);
        result.put("resultAlreadySubmitted", false);
        result.put("submittedByParticipant", participant);
        return result;
    }

    private void applyMmr(MatchRecord match) {
        List<MatchPlayer> allPlayers = match.getPlayers();
        List<MatchPlayer> players = allPlayers.stream().filter(player -> player.getUser() != null || player.getAttendance() != null).toList();
        if (players.isEmpty()) return;
        MmrType type = resolvedMmrType(match);
        double teamA = allPlayers.stream().filter(player -> player.getTeamNumber() == 1).mapToInt(player -> mmr(player, type)).average().orElse(1000);
        double teamB = allPlayers.stream().filter(player -> player.getTeamNumber() == 2).mapToInt(player -> mmr(player, type)).average().orElse(1000);
        int winner = match.getTeamAScore() > match.getTeamBScore() ? 1 : 2;
        for (MatchPlayer player : players) {
            int before = mmr(player, type);
            MatchPlayer partner = allPlayers.stream().filter(item -> item.getTeamNumber() == player.getTeamNumber() && !item.getId().equals(player.getId())).findFirst().orElse(player);
            long priorGames = player.getUser() != null ? matchPlayers.findUserMatchRecords(player.getUser().getId()).stream()
                    .filter(item -> !item.getMatch().getId().equals(match.getId()) && !item.getMatch().getPlayedAt().isAfter(match.getPlayedAt())).count()
                    : matchPlayers.findAllByMatch_Session_Id(match.getSession().getId()).stream()
                    .filter(item -> item.getAttendance() != null && item.getAttendance().getId().equals(player.getAttendance().getId()))
                    .filter(item -> !item.getMatch().getId().equals(match.getId()) && !item.getMatch().getPlayedAt().isAfter(match.getPlayedAt())).count();
            var playerGrade = player.getAttendance() != null ? grade(player.getAttendance()) : player.getUser().getGrade();
            MmrCalculationPolicy.Result calculation = mmrPolicy.calculate(new MmrCalculationPolicy.Input(
                    before, mmr(partner, type), player.getTeamNumber() == 1 ? teamA : teamB,
                    player.getTeamNumber() == 1 ? teamB : teamA, player.getTeamNumber() == winner,
                    match.isScoreEntered(), Math.abs(match.getTeamAScore() - match.getTeamBScore()), priorGames,
                    playerGrade, match.getSession().getSessionType(), match.getPlayStyle()));
            if (player.getAttendance() != null && player.getUser() == null) {
                int fallback = playerGrade == null ? 1000 : playerGrade.getInitialMmr();
                if (type == MmrType.MIXED) player.getAttendance().applyMixedMmr(calculation.delta(), fallback); else player.getAttendance().applyDoublesMmr(calculation.delta(), fallback);
            }
            if (player.getUser() != null) { if (type == MmrType.MIXED) player.getUser().applyMixedMmr(calculation.delta()); else player.getUser().applyDoublesMmr(calculation.delta()); }
            if (player.getAttendance() != null && player.getUser() != null) { if (type == MmrType.MIXED) player.getAttendance().syncMixedMmr(player.getUser().getMixedMmr()); else player.getAttendance().syncDoublesMmr(player.getUser().getDoublesMmr()); }
            int after = mmr(player, type);
            player.applyMmr(type, before, after);
            if (player.getUser() != null) mmrHistories.save(MmrHistory.create(player.getUser(), match, type, before, after,
                    calculation.baseK(), calculation.expectedWinRate(), calculation.scoreMultiplier(), calculation.confidenceMultiplier(),
                    calculation.teamGapMultiplier(), calculation.responsibilityMultiplier(), calculation.floorApplied(),
                    calculation.softCapApplied(), "MATCH_RESULT", LocalDateTime.now()));
        }
    }

    private void rollbackMmr(MatchRecord match) {
        MmrType type = resolvedMmrType(match);
        match.getPlayers().stream().filter(player -> (player.getUser() != null || player.getAttendance() != null) && player.getMmrDelta() != null).forEach(player -> {
            int before = mmr(player, type);
            int rollback = -player.getMmrDelta();
            var playerGrade = player.getAttendance() != null ? grade(player.getAttendance()) : player.getUser().getGrade();
            if (player.getAttendance() != null && player.getUser() == null) { int fallback = playerGrade == null ? 1000 : playerGrade.getInitialMmr(); if (type == MmrType.MIXED) player.getAttendance().applyMixedMmr(rollback, fallback); else player.getAttendance().applyDoublesMmr(rollback, fallback); }
            if (player.getUser() != null) { if (type == MmrType.MIXED) player.getUser().applyMixedMmr(rollback); else player.getUser().applyDoublesMmr(rollback); }
            if (player.getAttendance() != null && player.getUser() != null) { if (type == MmrType.MIXED) player.getAttendance().syncMixedMmr(player.getUser().getMixedMmr()); else player.getAttendance().syncDoublesMmr(player.getUser().getDoublesMmr()); }
            if (player.getUser() != null) mmrHistories.save(MmrHistory.correction(player.getUser(), match, type, before, mmr(player, type), "RESULT_EDIT_ROLLBACK"));
            player.clearMmr();
        });
    }

    private void recalculateMmrFrom(MatchRecord editedMatch) {
        MmrType targetType = resolvedMmrType(editedMatch);
        List<MatchRecord> candidates = matches.findAllByOperationStatusAndIsDeletedFalseOrderByPlayedAtAsc(MatchOperationStatus.RESULT_ENTERED).stream()
                .filter(match -> !match.getPlayedAt().isBefore(editedMatch.getPlayedAt()) && resolvedMmrType(match) == targetType).toList();
        Set<Long> affectedAttendances = editedMatch.getPlayers().stream().map(MatchPlayer::getAttendance).filter(Objects::nonNull).map(GroupSessionAttendance::getId).collect(Collectors.toSet());
        Set<Long> affectedUsers = editedMatch.getPlayers().stream().map(MatchPlayer::getUser).filter(Objects::nonNull).map(User::getId).collect(Collectors.toSet());
        List<MatchRecord> affectedMatches = new ArrayList<>();
        for (MatchRecord candidate : candidates) {
            boolean connected = candidate.getId().equals(editedMatch.getId()) || candidate.getPlayers().stream().map(MatchPlayer::getAttendance)
                    .filter(Objects::nonNull).anyMatch(attendance -> affectedAttendances.contains(attendance.getId()))
                    || candidate.getPlayers().stream().map(MatchPlayer::getUser).filter(Objects::nonNull).anyMatch(user -> affectedUsers.contains(user.getId()));
            if (!connected) continue;
            affectedMatches.add(candidate);
            candidate.getPlayers().stream().map(MatchPlayer::getAttendance).filter(Objects::nonNull).map(GroupSessionAttendance::getId).forEach(affectedAttendances::add);
            candidate.getPlayers().stream().map(MatchPlayer::getUser).filter(Objects::nonNull).map(User::getId).forEach(affectedUsers::add);
        }
        List<MatchRecord> reverse = new ArrayList<>(affectedMatches);
        Collections.reverse(reverse);
        reverse.forEach(this::rollbackMmr);
        affectedMatches.forEach(this::applyMmr);
        affectedMatches.stream().map(MatchRecord::getSession).collect(Collectors.toMap(GroupSession::getId, Function.identity(), (a, b) -> a))
                .values().forEach(session -> { refreshDailyRecords(session); publish(session, "MMR_UPDATED"); publish(session, "REPORT_UPDATED"); });
    }

    private void refreshDailyRecords(GroupSession session) {
        LocalDate date = session.getStartsAt().toLocalDate();
        Map<Long, List<MatchPlayer>> byUser = matchPlayers.findAllByMatch_Session_Id(session.getId()).stream()
                .filter(player -> player.getUser() != null && player.getMatch().getOperationStatus() == MatchOperationStatus.RESULT_ENTERED)
                .collect(Collectors.groupingBy(player -> player.getUser().getId()));
        byUser.values().forEach(players -> {
            User user = players.get(0).getUser();
            int wins = 0, pointsFor = 0, pointsAgainst = 0, doublesDelta = 0, mixedDelta = 0;
            for (MatchPlayer player : players) {
                MatchRecord current = player.getMatch();
                int mine = player.getTeamNumber() == 1 ? current.getTeamAScore() : current.getTeamBScore();
                int other = player.getTeamNumber() == 1 ? current.getTeamBScore() : current.getTeamAScore();
                if (mine > other) wins++;
                if (current.isScoreEntered()) { pointsFor += mine; pointsAgainst += other; }
                if (player.getUsedMmrType() == MmrType.MIXED) mixedDelta += player.getMmrDelta() == null ? 0 : player.getMmrDelta();
                else doublesDelta += player.getMmrDelta() == null ? 0 : player.getMmrDelta();
            }
            DailyRecord record = dailyRecords.findByUserIdAndRecordDate(user.getId(), date).orElseGet(() -> DailyRecord.create(user, date));
            record.update(players.size(), wins, pointsFor, pointsAgainst, doublesDelta, mixedDelta);
            dailyRecords.save(record);
        });
    }

    private void refreshDailyRecord(User user, LocalDate date) {
        List<MatchPlayer> players = matchPlayers.findUserMatchRecords(user.getId()).stream()
                .filter(player -> player.getMatch().getPlayedAt().toLocalDate().equals(date)
                        && player.getMatch().getOperationStatus() == MatchOperationStatus.RESULT_ENTERED).toList();
        Optional<DailyRecord> existing = dailyRecords.findByUserIdAndRecordDate(user.getId(), date);
        if (players.isEmpty()) {
            existing.ifPresent(dailyRecords::delete);
            return;
        }
        int wins = 0, pointsFor = 0, pointsAgainst = 0, doublesDelta = 0, mixedDelta = 0;
        for (MatchPlayer player : players) {
            MatchRecord match = player.getMatch();
            int mine = player.getTeamNumber() == 1 ? match.getTeamAScore() : match.getTeamBScore();
            int other = player.getTeamNumber() == 1 ? match.getTeamBScore() : match.getTeamAScore();
            if (mine > other) wins++;
            if (match.isScoreEntered()) { pointsFor += mine; pointsAgainst += other; }
            if (player.getUsedMmrType() == MmrType.MIXED) mixedDelta += player.getMmrDelta() == null ? 0 : player.getMmrDelta();
            else doublesDelta += player.getMmrDelta() == null ? 0 : player.getMmrDelta();
        }
        DailyRecord record = existing.orElseGet(() -> DailyRecord.create(user, date));
        record.update(players.size(), wins, pointsFor, pointsAgainst, doublesDelta, mixedDelta);
        dailyRecords.save(record);
    }

    private MatchRecord call(GroupSession session, SessionMatchQueue queue, int court) {
        queue.call(court);
        queue.getPlayers().forEach(player -> player.getAttendance().call());
        MatchRecord match = matches.save(MatchRecord.createOperational(session, queue, court));
        List<MatchPlayer> players = queue.getPlayers().stream().map(player -> MatchPlayer.create(match, player.getAttendance(), player.getTeamNumber())).toList();
        matchPlayers.saveAll(players);
        publish(session, "MATCH_ASSIGNED");
        MatchRecord assigned = matches.findByIdAndSessionId(match.getId(), session.getId()).orElse(match);
        start(assigned);
        publish(session, "MATCH_STARTED");
        return assigned;
    }

    private void start(MatchRecord match) {
        if (match.getOperationStatus() == MatchOperationStatus.RESULT_ENTERED || match.getOperationStatus() == MatchOperationStatus.CANCELED || match.getOperationStatus() == MatchOperationStatus.PLAYING) return;
        match.start();
        if (match.getMatchQueue() != null) match.getMatchQueue().start();
        match.getPlayers().forEach(player -> player.getAttendance().startPlaying());
        match.getPlayers().stream().map(MatchPlayer::getUser).filter(Objects::nonNull).forEach(user -> {
            notifications.sendIfEnabled(user, NotificationType.MATCH, "경기가 시작됐어요",
                    match.getCourtNumber() + "번 코트로 이동해 주세요. 경기가 끝나면 네 명 중 한 명이 결과를 입력해 주세요.",
                    "/sessions/" + PublicIdCodec.encode(match.getSession().getId()) + "/match-call", NotificationPreferenceType.MATCH_START);
        });
        publish(match.getSession(), "NOTIFICATION_SENT");
        refreshNextWindow(match.getSession());
    }

    private void autoCallNext(GroupSession session, Integer court, Set<Long> excludedAttendanceIds) {
        List<MatchRecord> assigned = assignToEmptyCourts(session, excludedAttendanceIds);
        if (assigned.isEmpty() && currentMatches(session.getId()).isEmpty()) assignToEmptyCourts(session, Set.of());
    }

    private void autoAssignEmptyCourts(GroupSession session) {
        assignToEmptyCourts(session, Set.of());
    }

    private List<MatchRecord> assignToEmptyCourts(GroupSession session, Set<Long> excludedAttendanceIds) {
        session = lockedSession(session.getId());
        List<MatchRecord> assigned = new ArrayList<>();
        for (int court = 1; court <= session.getCourtCount(); court++) {
            if (session.disabledCourtNumbers().contains(court)
                    || matches.existsBySessionIdAndCourtNumberAndOperationStatusIn(session.getId(), court, ACTIVE_MATCH)) continue;
            SessionMatchQueue next = activeQueues(session.getId()).stream()
                    .filter(queue -> queue.getStatus() == SessionQueueStatus.WAITING)
                    .filter(queue -> queue.getPlayers().stream().noneMatch(player -> excludedAttendanceIds.contains(player.getAttendance().getId())))
                    .filter(queue -> queue.getPlayers().stream().noneMatch(player -> unavailableForCall(player.getAttendance())))
                    .findFirst().orElse(null);
            if (next == null) break;
            assigned.add(call(session, next, court));
        }
        refreshNextWindow(session);
        return assigned;
    }

    private void refreshNextWindow(GroupSession session) {
        List<SessionMatchQueue> nextWindow = nextWindowQueues(session);
        Set<Long> active = nextWindow.stream().flatMap(item -> item.getPlayers().stream())
                .map(player -> player.getAttendance().getId()).collect(Collectors.toSet());
        Set<Long> newlyScheduled = new HashSet<>();
        for (GroupSessionAttendance attendance : attendances.findAllBySessionIdOrderByIdAsc(session.getId())) {
            if (active.contains(attendance.getId()) && attendance.getPlayStatus() != SessionPlayStatus.CALLING) {
                if (attendance.getPlayStatus() != SessionPlayStatus.NEXT_UP) newlyScheduled.add(attendance.getId());
                attendance.schedule();
            }
            else if (attendance.getPlayStatus() == SessionPlayStatus.NEXT_UP) attendance.changePlayStatus(SessionPlayStatus.AVAILABLE);
        }
        nextWindow.stream().flatMap(item -> item.getPlayers().stream())
                .filter(player -> newlyScheduled.contains(player.getAttendance().getId())).forEach(player -> {
            User user = user(player.getAttendance());
            if (user != null) notifications.sendIfEnabled(user, NotificationType.MATCH, "다음 경기 예정이에요",
                    "곧 경기 차례가 와요. 준비해 주세요.", "/sessions/" + PublicIdCodec.encode(session.getId()) + "/next-match", NotificationPreferenceType.NEXT_MATCH);
        });
        if (!newlyScheduled.isEmpty()) publish(session, "NOTIFICATION_SENT");
    }

    private List<SessionMatchQueue> nextWindowQueues(GroupSession session) {
        List<SessionMatchQueue> selected = new ArrayList<>();
        Set<Long> reservedAttendanceIds = new HashSet<>();
        for (SessionMatchQueue queue : activeQueues(session.getId())) {
            if (queue.getStatus() != SessionQueueStatus.CALLING
                    && queue.getPlayers().stream().anyMatch(player -> unavailableForCall(player.getAttendance()))) continue;
            Set<Long> attendanceIds = queue.getPlayers().stream().map(player -> player.getAttendance().getId()).collect(Collectors.toSet());
            if (attendanceIds.stream().anyMatch(reservedAttendanceIds::contains)) continue;
            selected.add(queue);
            reservedAttendanceIds.addAll(attendanceIds);
            if (selected.size() == session.getCourtCount()) break;
        }
        return selected;
    }

    private List<Candidate> candidates(List<GroupSessionAttendance> eligible, MatchType type, PlayStyle style,
                                       List<SessionParticipantRelation> relationList, Map<String, Integer> partnerHistory,
                                       Map<String, Integer> opponentHistory, Map<Long, Long> gameCounts,
                                       Map<Long, Long> scheduledCounts, Set<Long> forced, boolean allowConsecutivePlay) {
        List<Candidate> result = new ArrayList<>();
        for (int a = 0; a < eligible.size() - 3; a++) for (int b = a + 1; b < eligible.size() - 2; b++)
            for (int c = b + 1; c < eligible.size() - 1; c++) for (int d = c + 1; d < eligible.size(); d++) {
                List<GroupSessionAttendance> group = List.of(eligible.get(a), eligible.get(b), eligible.get(c), eligible.get(d));
                if (!allowConsecutivePlay && group.stream().anyMatch(item -> item.getConsecutivePlayCount() >= 1)) continue;
                int[][] splits = {{0,1,2,3},{0,2,1,3},{0,3,1,2}};
                Candidate best = null;
                for (int[] split : splits) {
                    List<GroupSessionAttendance> teamA = List.of(group.get(split[0]), group.get(split[1]));
                    List<GroupSessionAttendance> teamB = List.of(group.get(split[2]), group.get(split[3]));
                    if (!matchesPreferredType(teamA, teamB, type)) continue;
                    Candidate candidate = score(teamA, teamB, type, style, relationList, partnerHistory, opponentHistory, gameCounts, scheduledCounts, forced);
                    if (best == null || candidate.score() > best.score()) best = candidate;
                }
                if (best != null) result.add(best);
            }
        return result;
    }

    private Candidate score(List<GroupSessionAttendance> teamA, List<GroupSessionAttendance> teamB, MatchType type, PlayStyle style,
                            List<SessionParticipantRelation> relations, Map<String, Integer> partners, Map<String, Integer> opponents,
                            Map<Long, Long> gameCounts, Map<Long, Long> scheduledCounts, Set<Long> forced) {
        List<GroupSessionAttendance> all = candidatePlayers(teamA, teamB);
        MatchType skillType = type == MatchType.ANY && isMixedTeams(teamA, teamB) ? MatchType.MIXED_DOUBLES : type;
        double aMmr = teamA.stream().mapToDouble(item -> adjustedSkill(item, skillType)).average().orElse(1000);
        double bMmr = teamB.stream().mapToDouble(item -> adjustedSkill(item, skillType)).average().orElse(1000);
        double teamGap = Math.abs(aMmr - bMmr);
        double balanceWeight = style == PlayStyle.COMPETITIVE ? 1.4 : 1.0;
        double opportunityWeight = style == PlayStyle.FUN ? 1.35 : 1.0;
        double score = 100 - matchingPolicy.teamBalancePenalty(teamGap) * balanceWeight;
        score -= (teamInternalPenalty(teamA, skillType) + teamInternalPenalty(teamB, skillType)) * balanceWeight;

        int longRestCount = (int) all.stream().filter(item -> item.getConsecutiveRestCount() >= 2).count();
        for (GroupSessionAttendance item : all) {
            score += matchingPolicy.restBonus(item.getConsecutiveRestCount()) * opportunityWeight;
            score -= matchingPolicy.consecutivePenalty(item.getConsecutivePlayCount()) * opportunityWeight;
        }
        List<Long> games = all.stream().map(item -> gameCounts.getOrDefault(item.getId(), 0L)).toList();
        List<Long> projectedLoads = all.stream().map(item -> gameCounts.getOrDefault(item.getId(), 0L)
                + scheduledCounts.getOrDefault(item.getId(), 0L)).toList();
        long maxProjectedLoad = projectedLoads.stream().mapToLong(Long::longValue).max().orElse(0);
        long totalProjectedLoad = projectedLoads.stream().mapToLong(Long::longValue).sum();
        score -= all.stream()
                .mapToLong(item -> matchingPolicy.scheduledLoadPenalty(scheduledCounts.getOrDefault(item.getId(), 0L)))
                .sum() * opportunityWeight;
        long gameSpread = games.stream().mapToLong(Long::longValue).max().orElse(0) - games.stream().mapToLong(Long::longValue).min().orElse(0);
        score -= matchingPolicy.matchCountPenalty(gameSpread) * opportunityWeight;
        long newcomers = games.stream().filter(count -> count == 0).count();
        score += newcomers * 15 * opportunityWeight;
        double skillSpread = all.stream().mapToDouble(item -> adjustedSkill(item, skillType)).max().orElse(0)
                - all.stream().mapToDouble(item -> adjustedSkill(item, skillType)).min().orElse(0);
        if (skillSpread > 400) score -= newcomers * 15;

        boolean flexibleType = !matchesPreferredType(teamA, teamB, type);
        score -= flexibleType ? typeMismatchPenalty(all, type, teamGap) : 0;
        if (isGenderSplitMismatch(teamA, teamB)) score -= matchingPolicy.mixedSplitPenalty();
        score += relationScore(teamA, teamB, relations);
        int partnerDuplicates = pairCount(teamA.get(0), teamA.get(1), partners) + pairCount(teamB.get(0), teamB.get(1), partners);
        double duplicateWeight = style == PlayStyle.FUN ? 1.35 : 1.0;
        score -= matchingPolicy.duplicatePartnerPenalty(pairCount(teamA.get(0), teamA.get(1), partners)) * duplicateWeight;
        score -= matchingPolicy.duplicatePartnerPenalty(pairCount(teamB.get(0), teamB.get(1), partners)) * duplicateWeight;
        for (GroupSessionAttendance left : teamA) for (GroupSessionAttendance right : teamB)
            score -= matchingPolicy.duplicateOpponentPenalty(pairCount(left, right, opponents)) * duplicateWeight;
        int forcedCount = (int) all.stream().filter(item -> forced.contains(item.getId())).count();
        int blockedCount = (int) all.stream().filter(this::unavailableForCall).count();
        score += forcedCount * 60;
        List<String> explanations = new ArrayList<>();
        explanations.add(teamGap <= 50 ? "팀 전력 차이가 낮은 조합이에요." : "가능한 조합 중 팀 균형을 우선했어요.");
        if (longRestCount > 0) explanations.add("2연속 휴식 참가자를 우선 배정했어요.");
        if (gameSpread <= 1) explanations.add("오늘 경기 수가 비슷하도록 구성했어요.");
        if (newcomers > 0) explanations.add("첫 경기를 기다리는 참가자를 배려했어요.");
        if (partnerDuplicates == 0) explanations.add("파트너 중복이 없는 조합이에요.");
        if (flexibleType) explanations.add("선택한 경기 유형의 인원이 부족해 유연 매칭을 적용했어요.");
        if (forcedCount > 0) explanations.add("운영자가 지정한 우선 참가자를 반영했어요.");
        if (relationScore(teamA, teamB, relations) != 0) explanations.add("고정·회피 조합 설정을 반영했어요.");
        return new Candidate(teamA, teamB, Math.max(0, Math.round(score * 10.0) / 10.0), explanations,
                forcedCount, longRestCount, blockedCount, maxProjectedLoad, totalProjectedLoad,
                teamGap, partnerDuplicates, games.stream().mapToLong(Long::longValue).sum());
    }

    private double adjustedSkill(GroupSessionAttendance attendance, MatchType type) {
        return mmr(attendance, type) + matchingPolicy.ageAdjustment(ageGroup(attendance).name());
    }

    private int teamInternalPenalty(List<GroupSessionAttendance> team, MatchType type) { return matchingPolicy.teamInternalPenalty(Math.abs(mmr(team.get(0), type) - mmr(team.get(1), type))); }
    private int typeMismatchPenalty(List<GroupSessionAttendance> all, MatchType type, double teamGap) { long men = all.stream().filter(item -> gender(item) == Gender.MALE).count(); if (type == MatchType.ANY) return 0; boolean close = teamGap <= 100; if ((type == MatchType.MIXED_DOUBLES && men == 2) || (type == MatchType.MENS_DOUBLES && men >= 3) || (type == MatchType.WOMENS_DOUBLES && men <= 1)) return close ? 5 : 20; return 20; }
    private boolean matchesPreferredType(List<GroupSessionAttendance> teamA, List<GroupSessionAttendance> teamB, MatchType type) { if (type == MatchType.ANY) return !isGenderSplitMismatch(teamA, teamB); long men = candidatePlayers(teamA, teamB).stream().filter(item -> gender(item) == Gender.MALE).count(); if (type == MatchType.MENS_DOUBLES) return men == 4; if (type == MatchType.WOMENS_DOUBLES) return men == 0; return men == 2 && teamA.stream().filter(item -> gender(item) == Gender.MALE).count() == 1 && teamB.stream().filter(item -> gender(item) == Gender.MALE).count() == 1; }
    private void validateMatchType(MatchType type, List<GroupSessionAttendance> teamA, List<GroupSessionAttendance> teamB) { if (!matchesPreferredType(teamA, teamB, type)) throw new BusinessException(ErrorCode.INVALID_REQUEST); }
    private boolean unavailableForCall(GroupSessionAttendance attendance) { return attendance.getStatus() != SessionAttendanceStatus.ARRIVED || attendance.getPlayStatus() == SessionPlayStatus.PLAYING || attendance.getPlayStatus() == SessionPlayStatus.CALLING || attendance.getPlayStatus() == SessionPlayStatus.RESTING || attendance.getPlayStatus() == SessionPlayStatus.LEFT || attendance.getPlayStatus() == SessionPlayStatus.ABSENT; }
    private boolean isMixedTeams(List<GroupSessionAttendance> teamA, List<GroupSessionAttendance> teamB) { return teamA.stream().filter(item -> gender(item) == Gender.MALE).count() == 1 && teamB.stream().filter(item -> gender(item) == Gender.MALE).count() == 1; }
    private boolean isGenderSplitMismatch(List<GroupSessionAttendance> teamA, List<GroupSessionAttendance> teamB) {
        long men = candidatePlayers(teamA, teamB).stream().filter(item -> gender(item) == Gender.MALE).count();
        return men == 2 && !isMixedTeams(teamA, teamB);
    }

    private double relationScore(List<GroupSessionAttendance> teamA, List<GroupSessionAttendance> teamB, List<SessionParticipantRelation> list) {
        double score = 0;
        for (SessionParticipantRelation relation : list) {
            boolean sameTeam = containsPair(teamA, relation) || containsPair(teamB, relation);
            boolean sameMatch = candidatePlayers(teamA, teamB).stream().map(GroupSessionAttendance::getId).collect(Collectors.toSet())
                    .containsAll(Set.of(relation.getFirstAttendance().getId(), relation.getSecondAttendance().getId()));
            score += switch (relation.getRelationType()) {
                case FIXED_PARTNER -> sameTeam ? 35 : sameMatch ? -10 : 0;
                case TEAM_PREFERENCE -> sameTeam ? 18 : 0;
                case TEAM_AVOID -> sameTeam ? -55 : 0;
                case MATCH_AVOID -> sameMatch ? -90 : 0;
                case STRONG_PAIR_LIMIT -> sameTeam ? -35 : 0;
            };
        }
        return score;
    }

    private Map<String, Integer> pairHistory(Long sessionId, boolean partners) {
        Map<String, Integer> result = new HashMap<>();
        Map<Long, List<MatchPlayer>> grouped = matchPlayers.findAllByMatch_Session_Id(sessionId).stream()
                .filter(player -> player.getAttendance() != null)
                .filter(player -> player.getMatch().getOperationStatus() == MatchOperationStatus.RESULT_ENTERED
                        || player.getMatch().getOperationStatus() == MatchOperationStatus.PLAYING
                        || player.getMatch().getOperationStatus() == MatchOperationStatus.CALLING)
                .collect(Collectors.groupingBy(player -> player.getMatch().getId()));
        grouped.values().forEach(players -> {
            for (int i = 0; i < players.size(); i++) for (int j = i + 1; j < players.size(); j++) {
                if ((players.get(i).getTeamNumber() == players.get(j).getTeamNumber()) != partners) continue;
                String key = pairKey(players.get(i).getAttendance().getId(), players.get(j).getAttendance().getId());
                result.merge(key, 1, Integer::sum);
            }
        });
        activeQueues(sessionId).stream().filter(queue -> queue.getStatus() == SessionQueueStatus.WAITING).forEach(queue -> {
            List<SessionMatchQueuePlayer> players = queue.getPlayers();
            for (int i = 0; i < players.size(); i++) for (int j = i + 1; j < players.size(); j++) {
                if ((players.get(i).getTeamNumber() == players.get(j).getTeamNumber()) != partners) continue;
                String key = pairKey(players.get(i).getAttendance().getId(), players.get(j).getAttendance().getId());
                result.merge(key, 1, Integer::sum);
            }
        });
        return result;
    }

    private Map<Long, Long> scheduledCounts(Long sessionId) {
        Map<Long, Long> result = new HashMap<>();
        currentMatches(sessionId).stream().flatMap(match -> match.getPlayers().stream())
                .map(MatchPlayer::getAttendance).filter(Objects::nonNull)
                .forEach(attendance -> result.merge(attendance.getId(), 1L, Long::sum));
        activeQueues(sessionId).stream().filter(queue -> queue.getStatus() == SessionQueueStatus.WAITING)
                .flatMap(queue -> queue.getPlayers().stream()).map(SessionMatchQueuePlayer::getAttendance)
                .forEach(attendance -> result.merge(attendance.getId(), 1L, Long::sum));
        return result;
    }

    private Map<String, Object> reportMap(GroupSession session) {
        List<MatchRecord> all = matches.findAllBySessionIdAndIsDeletedFalseOrderByPlayedAtAsc(session.getId());
        List<GroupSessionAttendance> participants = attendances.findAllBySessionIdOrderByIdAsc(session.getId());
        Map<Long, List<MatchPlayer>> byAttendance = matchPlayers.findAllByMatch_Session_Id(session.getId()).stream()
                .filter(player -> player.getAttendance() != null && player.getMatch().getOperationStatus() == MatchOperationStatus.RESULT_ENTERED)
                .collect(Collectors.groupingBy(player -> player.getAttendance().getId()));
        List<Map<String, Object>> records = participants.stream().map(attendance -> participantRecord(attendance, byAttendance.getOrDefault(attendance.getId(), List.of()))).toList();
        Map<String, Object> result = sessionMap(session);
        result.put("summary", Map.of("participantCount", participants.size(), "totalMatchCount", all.stream().filter(match -> match.getOperationStatus() == MatchOperationStatus.RESULT_ENTERED).count(),
                "averageMatchCount", participants.isEmpty() ? 0 : Math.round(byAttendance.values().stream().mapToInt(List::size).sum() * 10.0 / participants.size()) / 10.0,
                "pendingResultCount", all.stream().filter(match -> match.getOperationStatus() == MatchOperationStatus.PLAYING).count()));
        result.put("participantRecords", records);
        result.put("matches", all.stream().filter(match -> match.getOperationStatus() == MatchOperationStatus.RESULT_ENTERED).map(this::matchMap).toList());
        Map<String, Object> analysis = new LinkedHashMap<>();
        analysis.put("matchTypes", Arrays.stream(MatchType.values()).collect(Collectors.toMap(Enum::name,
                type -> all.stream().filter(match -> match.getOperationStatus() == MatchOperationStatus.RESULT_ENTERED && match.getMatchType() == type).count(), (a, b) -> a, LinkedHashMap::new)));
        analysis.put("courtMatches", all.stream().filter(match -> match.getOperationStatus() == MatchOperationStatus.RESULT_ENTERED && match.getCourtNumber() != null)
                .collect(Collectors.groupingBy(MatchRecord::getCourtNumber, TreeMap::new, Collectors.counting())));
        analysis.put("partnerDuplicatePairs", pairHistory(session.getId(), true).values().stream().filter(count -> count > 1).count());
        analysis.put("opponentDuplicatePairs", pairHistory(session.getId(), false).values().stream().filter(count -> count > 1).count());
        analysis.put("totalPlayMinutes", all.stream().filter(match -> match.getOperationStatus() == MatchOperationStatus.RESULT_ENTERED && match.getEndedAt() != null).mapToLong(match -> Math.max(0, Duration.between(match.getStartedAt() == null ? match.getPlayedAt() : match.getStartedAt(), match.getEndedAt()).toMinutes())).sum());
        result.put("analysis", analysis);
        return result;
    }

    private Map<String, Object> participantRecord(GroupSessionAttendance attendance, List<MatchPlayer> players) {
        int wins = 0, pointsFor = 0, pointsAgainst = 0, mmrDelta = 0;
        for (MatchPlayer player : players) {
            MatchRecord match = player.getMatch();
            int mine = player.getTeamNumber() == 1 ? match.getTeamAScore() : match.getTeamBScore();
            int other = player.getTeamNumber() == 1 ? match.getTeamBScore() : match.getTeamAScore();
            if (mine > other) wins++;
            if (match.isScoreEntered()) { pointsFor += mine; pointsAgainst += other; }
            mmrDelta += player.getMmrDelta() == null ? 0 : player.getMmrDelta();
        }
        Map<String, Object> map = participantMap(attendance, players.size());
        map.put("wins", wins); map.put("losses", players.size() - wins); map.put("winRate", players.isEmpty() ? 0 : Math.round(wins * 1000.0 / players.size()) / 10.0);
        map.put("pointsFor", pointsFor); map.put("pointsAgainst", pointsAgainst); map.put("mmrDelta", mmrDelta);
        return map;
    }

    private Map<String, Object> participantRecordMatch(MatchPlayer player) {
        MatchRecord match = player.getMatch();
        int mine = player.getTeamNumber() == 1 ? match.getTeamAScore() : match.getTeamBScore();
        int other = player.getTeamNumber() == 1 ? match.getTeamBScore() : match.getTeamAScore();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("matchId", match.getId()); map.put("court", match.getCourtNumber()); map.put("matchType", match.getMatchType());
        map.put("partner", match.getPlayers().stream().filter(item -> item.getTeamNumber() == player.getTeamNumber() && !item.getId().equals(player.getId())).map(MatchPlayer::displayName).findFirst().orElse(null));
        map.put("opponents", match.getPlayers().stream().filter(item -> item.getTeamNumber() != player.getTeamNumber()).map(MatchPlayer::displayName).toList());
        map.put("myScore", match.isScoreEntered() ? mine : null); map.put("opponentScore", match.isScoreEntered() ? other : null); map.put("result", mine > other ? "WIN" : "LOSS");
        MmrType mmrType = player.getUsedMmrType() == null ? resolvedMmrType(match) : player.getUsedMmrType();
        map.put("status", match.isResultUpdated() ? "RESULT_UPDATED" : "RESULT_ENTERED"); map.put("mmrType", mmrType.name());
        map.put("mmrBefore", player.getMmrBefore()); map.put("mmrAfter", player.getMmrAfter()); map.put("mmrDelta", player.getMmrDelta() == null ? 0 : player.getMmrDelta());
        map.put("completedAt", match.getEndedAt()); map.put("resultUpdated", match.isResultUpdated());
        return map;
    }

    private Map<String, Object> summary(List<GroupSessionAttendance> participants, List<MatchRecord> current,
                                        List<SessionMatchQueue> queue, List<MatchRecord> all) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("attendanceCount", participants.stream().filter(item -> item.getStatus() == SessionAttendanceStatus.ARRIVED).count());
        for (SessionPlayStatus status : SessionPlayStatus.values()) map.put(toCamel(status.name()) + "Count", participants.stream().filter(item -> item.getPlayStatus() == status).count());
        map.put("currentMatchCount", current.size()); map.put("queueCount", queue.size());
        map.put("pendingResultCount", all.stream().filter(match -> match.getOperationStatus() == MatchOperationStatus.PLAYING).count());
        return map;
    }

    private List<String> alerts(GroupSession session, List<GroupSessionAttendance> participants, List<MatchRecord> current, List<SessionMatchQueue> queue) {
        List<String> alerts = new ArrayList<>();
        if (queue.size() < session.getCourtCount()) alerts.add("경기 후보 큐가 부족해요.");
        if (participants.stream().filter(item -> item.getPlayStatus() == SessionPlayStatus.AVAILABLE || item.getPlayStatus() == SessionPlayStatus.WAITING).count() < 4) alerts.add("경기 가능한 참가자가 4명보다 적어요.");
        if (current.stream().anyMatch(match -> match.getOperationStatus() == MatchOperationStatus.CALLING && match.getCalledAt().isBefore(LocalDateTime.now().minusMinutes(2)))) alerts.add("입장 호출 후 2분이 지나 자동으로 경기 중 전환된 경기를 확인해 주세요.");
        for (GroupSessionAttendance attendance : participants) {
            User user = user(attendance);
            if (user == null || user.getGrade() == null || Math.max(user.getDoublesMmr(), user.getMixedMmr()) <= user.getGrade().getSoftCapMmr()) continue;
            List<MatchPlayer> records = matchPlayers.findAllByMatch_Session_Id(session.getId()).stream()
                    .filter(player -> player.getAttendance() != null && player.getAttendance().getId().equals(attendance.getId()) && player.getMatch().getOperationStatus() == MatchOperationStatus.RESULT_ENTERED).toList();
            long wins = records.stream().filter(player -> player.getTeamNumber() == (player.getMatch().getTeamAScore() > player.getMatch().getTeamBScore() ? 1 : 2)).count();
            if (records.size() >= 5 && wins * 100 >= records.size() * 70L) alerts.add(name(attendance) + "님의 급수 재평가를 확인해 주세요.");
        }
        return alerts;
    }

    private Map<String, Object> sessionMap(GroupSession session) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("sessionId", session.getId()); map.put("groupId", session.getGroup().getId()); map.put("groupName", session.getGroup().getName());
        map.put("title", session.getTitle()); map.put("startsAt", session.getStartsAt()); map.put("endsAt", session.getEndsAt());
        map.put("place", session.getPlace()); map.put("courtCount", session.getCourtCount()); map.put("disabledCourtNumbers", session.disabledCourtNumbers()); map.put("status", session.getStatus()); map.put("entryCode", session.getEntryCode());
        return map;
    }

    private Map<String, Object> participantMap(GroupSessionAttendance attendance, long games) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("attendanceId", attendance.getId()); map.put("name", name(attendance)); map.put("participantType", attendance.getMember() != null ? "MEMBER" : "GUEST");
        map.put("gender", attendance.getMember() != null ? attendance.getMember().getUser().getGender() : attendance.getGuest().getGender());
        map.put("ageGroup", attendance.getMember() != null ? attendance.getMember().getUser().getAgeGroup() : attendance.getGuest().getAgeGroup());
        map.put("grade", attendance.getMember() != null ? attendance.getMember().getUser().getGrade() : attendance.getGuest().getGrade());
        map.put("doublesMmr", attendance.currentDoublesMmr(fallbackMmr(attendance, MmrType.DOUBLES)));
        map.put("mixedMmr", attendance.currentMixedMmr(fallbackMmr(attendance, MmrType.MIXED)));
        map.put("attendanceStatus", attendance.getStatus()); map.put("playStatus", attendance.getPlayStatus()); map.put("games", games);
        map.put("consecutivePlayCount", attendance.getConsecutivePlayCount()); map.put("consecutiveRestCount", attendance.getConsecutiveRestCount());
        map.put("arrivedAt", attendance.getArrivedAt()); map.put("lateExpectedAt", attendance.getExpectedArrivalAt()); map.put("lateReason", attendance.getLateReason());
        map.put("memo", attendance.getOperatorMemo() != null ? attendance.getOperatorMemo() : attendance.getMember() == null ? null : attendance.getMember().getMemo());
        return map;
    }

    private Map<String, Object> queueMap(SessionMatchQueue queue) {
        Map<String, Object> map = publicQueueMap(queue);
        map.put("score", queue.getScore()); map.put("playStyle", queue.getPlayStyle()); map.put("explanations", queue.getExplanation() == null ? List.of() : Arrays.asList(queue.getExplanation().split("\n")));
        return map;
    }

    private Map<String, Object> publicQueueMap(SessionMatchQueue queue) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("queueId", queue.getId()); map.put("queueOrder", queue.getQueueOrder()); map.put("status", queue.getStatus()); map.put("courtNumber", queue.getAssignedCourtNumber());
        map.put("matchType", queue.getMatchType()); map.put("calledAt", queue.getCalledAt()); map.put("teams", teams(queue.getPlayers().stream().map(player -> Map.entry(player.getTeamNumber(), player.getAttendance())).toList()));
        return map;
    }

    private Map<String, Object> matchMap(MatchRecord match) {
        Map<String, Object> map = publicMatchMap(match);
        map.put("playStyle", match.getPlayStyle()); map.put("resultUpdated", match.isResultUpdated()); map.put("resultUpdateReason", match.getResultUpdateReason());
        map.put("mmrResults", match.getPlayers().stream().filter(player -> player.getUser() != null).map(player -> Map.of("name", player.displayName(), "before", player.getMmrBefore() == null ? 0 : player.getMmrBefore(), "after", player.getMmrAfter() == null ? 0 : player.getMmrAfter(), "delta", player.getMmrDelta() == null ? 0 : player.getMmrDelta())).toList());
        map.put("resultHistory", resultRevisions.findAllByMatchIdOrderByCreatedAtDesc(match.getId()).stream().map(item -> Map.of(
                "previousScore", item.getPreviousTeamAScore() + ":" + item.getPreviousTeamBScore(),
                "newScore", item.getNewTeamAScore() + ":" + item.getNewTeamBScore(),
                "previousScoreEntered", item.isPreviousScoreEntered(), "newScoreEntered", item.isNewScoreEntered(),
                "reason", item.getReason(), "modifiedBy", item.getModifiedBy().getName(), "modifiedAt", item.getCreatedAt())).toList());
        return map;
    }

    private Map<String, Object> publicMatchMap(MatchRecord match) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("matchId", match.getId()); map.put("courtNumber", match.getCourtNumber()); map.put("matchType", match.getMatchType()); map.put("status", match.getOperationStatus());
        map.put("calledAt", match.getCalledAt()); map.put("startedAt", match.getStartedAt() == null ? match.getPlayedAt() : match.getStartedAt()); map.put("endedAt", match.getEndedAt());
        map.put("teamAScore", match.getTeamAScore()); map.put("teamBScore", match.getTeamBScore());
        map.put("scoreEntered", match.isScoreEntered());
        map.put("teams", teams(match.getPlayers().stream().filter(player -> player.getAttendance() != null).map(player -> Map.entry(player.getTeamNumber(), player.getAttendance())).toList()));
        return map;
    }

    private Map<String, Object> participantMatchMap(MatchRecord match, GroupSessionAttendance attendance) {
        MatchPlayer me = match.getPlayers().stream().filter(player -> player.getAttendance() != null && player.getAttendance().getId().equals(attendance.getId())).findFirst().orElseThrow();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("matchId", match.getId()); map.put("matchQueueId", match.getMatchQueue() == null ? null : match.getMatchQueue().getId());
        map.put("court", match.getCourtNumber()); map.put("matchType", match.getMatchType()); map.put("assignedAt", match.getCalledAt());
        map.put("partner", match.getPlayers().stream().filter(player -> player.getTeamNumber() == me.getTeamNumber() && !player.getId().equals(me.getId())).map(MatchPlayer::displayName).findFirst().orElse(null));
        map.put("opponents", match.getPlayers().stream().filter(player -> player.getTeamNumber() != me.getTeamNumber()).map(MatchPlayer::displayName).toList());
        return map;
    }

    private Map<String, Object> participantQueueMap(SessionMatchQueue queue, GroupSessionAttendance attendance) {
        SessionMatchQueuePlayer me = queue.getPlayers().stream().filter(player -> player.getAttendance().getId().equals(attendance.getId())).findFirst().orElseThrow();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("matchQueueId", queue.getId());
        map.put("matchId", matches.findByMatchQueueId(queue.getId()).map(MatchRecord::getId).orElse(null));
        map.put("court", queue.getAssignedCourtNumber()); map.put("matchType", queue.getMatchType()); map.put("assignedAt", queue.getCalledAt());
        map.put("partner", queue.getPlayers().stream().filter(player -> player.getTeamNumber() == me.getTeamNumber() && !player.getId().equals(me.getId())).map(player -> name(player.getAttendance())).findFirst().orElse(null));
        map.put("opponents", queue.getPlayers().stream().filter(player -> player.getTeamNumber() != me.getTeamNumber()).map(player -> name(player.getAttendance())).toList());
        return map;
    }

    private List<Map<String, Object>> teams(List<Map.Entry<Integer, GroupSessionAttendance>> players) {
        return List.of(1, 2).stream().map(team -> Map.<String, Object>of("teamNumber", team, "players", players.stream().filter(item -> item.getKey() == team)
                .map(item -> Map.of("attendanceId", item.getValue().getId(), "name", name(item.getValue()), "grade", grade(item.getValue()).name())).toList())).toList();
    }

    private Map<String, Object> relationMap(SessionParticipantRelation relation) {
        return Map.of("relationId", relation.getId(), "firstAttendanceId", relation.getFirstAttendance().getId(), "firstName", name(relation.getFirstAttendance()),
                "secondAttendanceId", relation.getSecondAttendance().getId(), "secondName", name(relation.getSecondAttendance()), "relationType", relation.getRelationType());
    }

    private GroupSession operatorOperationSession(Long userId, Long sessionId) {
        GroupSession session = operatorSession(userId, sessionId);
        if (session.getStatus() == GroupSessionStatus.CLOSED || session.getStatus() == GroupSessionStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.CONFLICT);
        }
        return session;
    }

    private GroupSession operatorSession(Long userId, Long sessionId) {
        if (userId == null) throw new BusinessException(ErrorCode.UNAUTHORIZED);
        GroupSession session = session(sessionId);
        access.scheduleManager(session.getGroup().getId(), userId);
        return session;
    }

    private GroupSession session(Long id) { return sessions.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); }
    private GroupSession lockedSession(Long id) { return sessions.findLockedByIdAndIsDeletedFalse(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); }
    private GroupSessionAttendance attendance(Long sessionId, Long id) { return attendances.findByIdAndSessionId(id, sessionId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); }
    private SessionMatchQueue queue(Long sessionId, Long id) { return queues.findByIdAndSessionId(id, sessionId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); }
    private MatchRecord match(Long sessionId, Long id) { return matches.findByIdAndSessionId(id, sessionId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); }
    private List<SessionMatchQueue> activeQueues(Long id) { return queues.findAllBySessionIdAndStatusInOrderByQueueOrderAsc(id, ACTIVE_QUEUE); }
    private boolean hasMatchHistory(Long sessionId) { return matches.existsBySessionIdAndIsDeletedFalse(sessionId); }
    private boolean hasFreeCourt(GroupSession session) { for (int court = 1; court <= session.getCourtCount(); court++) if (!session.disabledCourtNumbers().contains(court) && !matches.existsBySessionIdAndCourtNumberAndOperationStatusIn(session.getId(), court, ACTIVE_MATCH)) return true; return false; }
    private Map<Long, Long> completedGameCounts(Long sessionId) {
        return matchPlayers.findAllByMatch_Session_Id(sessionId).stream()
                .filter(player -> player.getAttendance() != null && player.getMatch().getOperationStatus() == MatchOperationStatus.RESULT_ENTERED)
                .collect(Collectors.groupingBy(player -> player.getAttendance().getId(), Collectors.counting()));
    }
    private long completedGameCount(Long attendanceId) {
        return matchPlayers.countByAttendanceIdAndMatchOperationStatusAndMatchIsDeletedFalse(
                attendanceId, MatchOperationStatus.RESULT_ENTERED);
    }
    private List<MatchRecord> currentMatches(Long id) { return matches.findAllBySessionIdAndOperationStatusInAndIsDeletedFalseOrderByCourtNumberAsc(id, ACTIVE_MATCH); }
    private int firstFreeCourt(GroupSession session) { for (int court = 1; court <= session.getCourtCount(); court++) if (!session.disabledCourtNumbers().contains(court) && !matches.existsBySessionIdAndCourtNumberAndOperationStatusIn(session.getId(), court, ACTIVE_MATCH)) return court; return -1; }
    private void publish(GroupSession session, String type) { events.session(session.getGroup().getId(), session.getId(), type); }
    private User user(GroupSessionAttendance attendance) { return attendance.getMember() != null ? attendance.getMember().getUser() : attendance.getGuest().getUser(); }
    private String name(GroupSessionAttendance attendance) { return attendance.getMember() != null ? attendance.getMember().getUser().getName() : attendance.getGuest().getName(); }
    private com.shuttleplay.server.domain.user.enums.Grade grade(GroupSessionAttendance attendance) { return attendance.getMember() != null ? attendance.getMember().getUser().getGrade() : attendance.getGuest().getGrade(); }
    private int mmr(GroupSessionAttendance attendance, MatchType type) { MmrType mmrType = type == MatchType.MIXED_DOUBLES ? MmrType.MIXED : MmrType.DOUBLES; int fallback = fallbackMmr(attendance, mmrType); return mmrType == MmrType.MIXED ? attendance.currentMixedMmr(fallback) : attendance.currentDoublesMmr(fallback); }
    private int mmr(User user, MmrType type) { return type == MmrType.MIXED ? user.getMixedMmr() : user.getDoublesMmr(); }
    private int mmr(MatchPlayer player, MmrType type) { if (player.getUser() != null) return mmr(player.getUser(), type); if (player.getAttendance() != null) { int fallback = fallbackMmr(player.getAttendance(), type); return type == MmrType.MIXED ? player.getAttendance().currentMixedMmr(fallback) : player.getAttendance().currentDoublesMmr(fallback); } return 1000; }
    private int fallbackMmr(GroupSessionAttendance attendance, MmrType type) { User linked = user(attendance); if (linked != null) return mmr(linked, type); return grade(attendance).getInitialMmr(); }
    private MmrType resolvedMmrType(MatchRecord match) {
        if (match.getMatchType() == MatchType.MIXED_DOUBLES) return MmrType.MIXED;
        if (match.getMatchType() != MatchType.ANY) return MmrType.DOUBLES;
        long men = match.getPlayers().stream().filter(player -> player.getAttendance() != null && gender(player.getAttendance()) == Gender.MALE).count();
        boolean mixedTeams = men == 2 && match.getPlayers().stream().filter(player -> player.getTeamNumber() == 1 && player.getAttendance() != null && gender(player.getAttendance()) == Gender.MALE).count() == 1
                && match.getPlayers().stream().filter(player -> player.getTeamNumber() == 2 && player.getAttendance() != null && gender(player.getAttendance()) == Gender.MALE).count() == 1;
        return mixedTeams ? MmrType.MIXED : MmrType.DOUBLES;
    }
    private List<GroupSessionAttendance> candidatePlayers(Candidate candidate) { return candidatePlayers(candidate.teamA(), candidate.teamB()); }
    private List<GroupSessionAttendance> candidatePlayers(List<GroupSessionAttendance> a, List<GroupSessionAttendance> b) { List<GroupSessionAttendance> all = new ArrayList<>(a); all.addAll(b); return all; }
    private Gender gender(GroupSessionAttendance attendance) { return attendance.getMember() != null ? attendance.getMember().getUser().getGender() : attendance.getGuest().getGender(); }
    private com.shuttleplay.server.domain.user.enums.AgeGroup ageGroup(GroupSessionAttendance attendance) { var age = attendance.getMember() != null ? attendance.getMember().getUser().getAgeGroup() : attendance.getGuest().getAgeGroup(); return age == null ? com.shuttleplay.server.domain.user.enums.AgeGroup.THIRTIES : age; }
    private boolean containsPair(List<GroupSessionAttendance> team, SessionParticipantRelation relation) { Set<Long> ids = team.stream().map(GroupSessionAttendance::getId).collect(Collectors.toSet()); return ids.contains(relation.getFirstAttendance().getId()) && ids.contains(relation.getSecondAttendance().getId()); }
    private boolean samePair(SessionParticipantRelation relation, GroupSessionAttendance first, GroupSessionAttendance second) { return Set.of(relation.getFirstAttendance().getId(), relation.getSecondAttendance().getId()).equals(Set.of(first.getId(), second.getId())); }
    private int pairCount(GroupSessionAttendance a, GroupSessionAttendance b, Map<String, Integer> source) { return source.getOrDefault(pairKey(a.getId(), b.getId()), 0); }
    private String pairKey(Long a, Long b) { return Math.min(a, b) + ":" + Math.max(a, b); }
    private ResultScores scores(Map<String, Object> body) { boolean entered = !Boolean.FALSE.equals(body.get("scoreEntered")); int a = intValue(body.get("teamAScore"), -1), b = intValue(body.get("teamBScore"), -1); if (a < 0 || b < 0 || a == b) throw new BusinessException(ErrorCode.INVALID_REQUEST); return new ResultScores(a, b, entered); }
    private int intValue(Object value, int fallback) { try { return value == null ? fallback : Integer.parseInt(String.valueOf(value)); } catch (NumberFormatException exception) { return fallback; } }
    private Long longValue(Map<String, Object> body, String key) { try { return Long.valueOf(String.valueOf(body.get(key))); } catch (Exception exception) { throw new BusinessException(ErrorCode.INVALID_REQUEST); } }
    private Set<Long> longSet(Object value) { if (!(value instanceof Collection<?> values)) return Set.of(); return values.stream().map(item -> Long.valueOf(String.valueOf(item))).collect(Collectors.toSet()); }
    private List<Long> teamIds(Map<String, Object> body, String key) { if (!(body.get(key) instanceof Collection<?> values)) return List.of(); return values.stream().map(item -> Long.valueOf(String.valueOf(item))).toList(); }
    private String string(Object value) { return value == null ? "" : String.valueOf(value).trim(); }
    private <T extends Enum<T>> T enumValue(Class<T> type, Object value, T fallback) { try { return value == null ? fallback : Enum.valueOf(type, String.valueOf(value)); } catch (IllegalArgumentException exception) { return fallback; } }
    private String toCamel(String value) { String[] parts = value.toLowerCase().split("_"); StringBuilder result = new StringBuilder(parts[0]); for (int i = 1; i < parts.length; i++) result.append(Character.toUpperCase(parts[i].charAt(0))).append(parts[i].substring(1)); return result.toString(); }
}
