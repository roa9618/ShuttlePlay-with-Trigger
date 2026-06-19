package com.shuttleplay.server.domain.record.service;

import com.shuttleplay.server.domain.group.entity.GroupSessionAttendance;
import com.shuttleplay.server.domain.group.enums.SessionAttendanceStatus;
import com.shuttleplay.server.domain.group.repository.GroupSessionAttendanceRepository;
import com.shuttleplay.server.domain.record.dto.MatchRecordPageResponse;
import com.shuttleplay.server.domain.record.dto.MmrHistoryResponse;
import com.shuttleplay.server.domain.record.dto.MyRecordSummaryResponse;
import com.shuttleplay.server.domain.record.entity.MatchPlayer;
import com.shuttleplay.server.domain.record.entity.MatchRecord;
import com.shuttleplay.server.domain.record.entity.MmrHistory;
import com.shuttleplay.server.domain.record.enums.MatchType;
import com.shuttleplay.server.domain.record.enums.MatchOperationStatus;
import com.shuttleplay.server.domain.record.enums.MmrType;
import com.shuttleplay.server.domain.record.enums.PlayStyle;
import com.shuttleplay.server.domain.record.repository.MatchPlayerRepository;
import com.shuttleplay.server.domain.record.repository.MmrHistoryRepository;
import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.domain.user.repository.UserRepository;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MyRecordService {
    private static final int RECENT_MATCH_COUNT = 5;
    private final UserRepository users;
    private final MatchPlayerRepository matchPlayers;
    private final GroupSessionAttendanceRepository attendances;
    private final MmrHistoryRepository mmrHistories;

    public MyRecordSummaryResponse summary(Long userId, YearMonth month) {
        User user = findUser(userId);
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime joinedAt = user.getCreatedAt();
        List<MatchPlayer> allMatches = matchPlayers.findUserMatchRecords(userId);
        List<GroupSessionAttendance> allAttendance = attendances.findUserRecordAttendances(
                userId,
                joinedAt,
                now.plusDays(1),
                List.of(SessionAttendanceStatus.ARRIVED, SessionAttendanceStatus.LATE)
        );
        LocalDateTime monthStart = month.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = month.plusMonths(1).atDay(1).atStartOfDay();
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime currentMonthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime currentMonthEnd = currentMonth.plusMonths(1).atDay(1).atStartOfDay();
        List<MatchPlayer> todayMatches = filterMatches(allMatches, today.atStartOfDay(), today.plusDays(1).atStartOfDay());
        List<MatchPlayer> monthMatches = filterMatches(allMatches, monthStart, monthEnd);
        List<GroupSessionAttendance> todayAttendance = filterAttendance(allAttendance, today.atStartOfDay(), today.plusDays(1).atStartOfDay());
        List<GroupSessionAttendance> monthAttendance = filterAttendance(allAttendance, monthStart, monthEnd);
        int doublesCurrentMonthChange = mmrChange(userId, MmrType.DOUBLES, currentMonthStart, currentMonthEnd);
        int mixedCurrentMonthChange = mmrChange(userId, MmrType.MIXED, currentMonthStart, currentMonthEnd);
        int doublesSelectedMonthChange = mmrChange(userId, MmrType.DOUBLES, monthStart, monthEnd);
        int mixedSelectedMonthChange = mmrChange(userId, MmrType.MIXED, monthStart, monthEnd);

        return new MyRecordSummaryResponse(
                new MyRecordSummaryResponse.Profile(user.getName(), user.getProfileImageUrl(), value(user.getGender()), value(user.getAgeGroup()), value(user.getGrade())),
                new MyRecordSummaryResponse.MmrOverview(user.getDoublesMmr(), user.getMixedMmr(), doublesCurrentMonthChange, mixedCurrentMonthChange),
                stats(todayMatches, todayAttendance, mmrChange(userId, MmrType.DOUBLES, today.atStartOfDay(), today.plusDays(1).atStartOfDay()), mmrChange(userId, MmrType.MIXED, today.atStartOfDay(), today.plusDays(1).atStartOfDay())),
                stats(monthMatches, monthAttendance, doublesSelectedMonthChange, mixedSelectedMonthChange),
                activity(allAttendance, today.minusYears(1).plusDays(1), today),
                allMatches.stream().limit(RECENT_MATCH_COUNT).map(this::matchItem).toList(),
                people(allMatches),
                habit(user, allAttendance),
                playStyle(allMatches),
                groupStats(allMatches, allAttendance),
                highlights(allMatches)
        );
    }

    public MmrHistoryResponse mmrHistory(Long userId, MmrType type, LocalDate from, LocalDate to) {
        User user = findUser(userId);
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();
        List<MmrHistory> histories = mmrHistories
                .findAllByUserIdAndMmrTypeAndChangedAtBetweenAndIsDeletedFalseOrderByChangedAtAsc(userId, type, start, end);
        List<MmrHistoryResponse.Point> points = histories.stream().map(history -> new MmrHistoryResponse.Point(
                history.getId(), history.getChangedAt(), history.getBeforeMmr(), history.getAfterMmr(),
                history.getAfterMmr() - history.getBeforeMmr())).toList();
        int current = type == MmrType.DOUBLES ? user.getDoublesMmr() : user.getMixedMmr();
        int total = points.stream().mapToInt(MmrHistoryResponse.Point::change).sum();
        return new MmrHistoryResponse(type.name(), current, total, points);
    }

    public MatchRecordPageResponse matches(Long userId, int page, int size, LocalDate from, LocalDate to,
                                           Long groupId, MatchType type, String result) {
        findUser(userId);
        int safeSize = Math.min(Math.max(size, 1), 50);
        int safePage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "match.playedAt"));
        Page<MatchPlayer> matchPage = matchPlayers.findAll(
                matchSpecification(userId, from, to, groupId, type, result),
                pageable
        );
        return new MatchRecordPageResponse(
                matchPage.stream().map(this::matchItem).toList(),
                matchPage.getNumber(),
                matchPage.getSize(),
                matchPage.getTotalElements(),
                matchPage.getTotalPages()
        );
    }

    private Specification<MatchPlayer> matchSpecification(
            Long userId,
            LocalDate from,
            LocalDate to,
            Long groupId,
            MatchType type,
            String result
    ) {
        return (root, query, criteriaBuilder) -> {
            var match = root.get("match");
            List<jakarta.persistence.criteria.Predicate> conditions = new ArrayList<>();
            conditions.add(criteriaBuilder.equal(root.get("user").get("id"), userId));
            conditions.add(criteriaBuilder.isFalse(match.get("isDeleted")));
            conditions.add(criteriaBuilder.equal(match.get("operationStatus"), MatchOperationStatus.RESULT_ENTERED));
            if (from != null) conditions.add(criteriaBuilder.greaterThanOrEqualTo(match.get("playedAt"), from.atStartOfDay()));
            if (to != null) conditions.add(criteriaBuilder.lessThan(match.get("playedAt"), to.plusDays(1).atStartOfDay()));
            if (groupId != null) conditions.add(criteriaBuilder.equal(match.get("session").get("group").get("id"), groupId));
            if (type != null) conditions.add(criteriaBuilder.equal(match.get("matchType"), type));
            if ("WIN".equals(result) || "LOSS".equals(result)) {
                var teamNumber = root.<Integer>get("teamNumber");
                var teamAScore = match.<Integer>get("teamAScore");
                var teamBScore = match.<Integer>get("teamBScore");
                var won = criteriaBuilder.or(
                        criteriaBuilder.and(criteriaBuilder.equal(teamNumber, 1), criteriaBuilder.greaterThan(teamAScore, teamBScore)),
                        criteriaBuilder.and(criteriaBuilder.equal(teamNumber, 2), criteriaBuilder.greaterThan(teamBScore, teamAScore))
                );
                conditions.add("WIN".equals(result) ? won : criteriaBuilder.not(won));
            }
            return criteriaBuilder.and(conditions.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private MyRecordSummaryResponse.PeriodStats stats(List<MatchPlayer> matches, List<GroupSessionAttendance> attendance,
                                                       int doublesChange, int mixedChange) {
        int wins = (int) matches.stream().filter(this::won).count();
        int pointsFor = matches.stream().mapToInt(this::myScore).sum();
        int pointsAgainst = matches.stream().mapToInt(this::opponentScore).sum();
        return new MyRecordSummaryResponse.PeriodStats(!matches.isEmpty() || !attendance.isEmpty(), matches.size(), wins,
                matches.size() - wins, rate(wins, matches.size()), pointsFor, pointsAgainst,
                attendance.stream().mapToLong(this::exerciseMinutes).sum(), attendance.size(), doublesChange, mixedChange);
    }

    private List<MyRecordSummaryResponse.ActivityDay> activity(List<GroupSessionAttendance> source, LocalDate from, LocalDate to) {
        return source.stream().filter(item -> !participationAt(item).toLocalDate().isBefore(from) && !participationAt(item).toLocalDate().isAfter(to))
                .collect(Collectors.groupingBy(item -> participationAt(item).toLocalDate(), TreeMap::new, Collectors.toList()))
                .entrySet().stream().map(entry -> new MyRecordSummaryResponse.ActivityDay(entry.getKey(), entry.getValue().size(),
                        entry.getValue().stream().mapToLong(this::exerciseMinutes).sum(), entry.getValue().stream().map(item ->
                        new MyRecordSummaryResponse.ActivityItem(item.getSession().getGroup().getName(), item.getSession().getTitle(),
                                item.getSession().getStartsAt(), item.getSession().getEndsAt())).toList())).toList();
    }

    private MyRecordSummaryResponse.People people(List<MatchPlayer> matches) {
        return new MyRecordSummaryResponse.People(topPeople(matches, true), topPeople(matches, false));
    }

    private List<MyRecordSummaryResponse.Person> topPeople(List<MatchPlayer> matches, boolean partner) {
        Map<PersonKey, List<MatchPlayer>> grouped = new HashMap<>();
        matches.forEach(me -> me.getMatch().getPlayers().stream()
                .filter(other -> !samePlayer(other, me))
                .filter(other -> (other.getTeamNumber() == me.getTeamNumber()) == partner)
                .forEach(other -> grouped.computeIfAbsent(personKey(other), key -> new ArrayList<>()).add(other)));
        return grouped.values().stream().sorted(Comparator.<List<MatchPlayer>>comparingInt(List::size).reversed()
                        .thenComparing(list -> list.get(0).getMatch().getPlayedAt(), Comparator.reverseOrder())).limit(3)
                .map(list -> {
                    MatchPlayer player = list.get(0);
                    PersonKey key = personKey(player);
                    return new MyRecordSummaryResponse.Person(key.userId(), key.name(), key.profileImageUrl(), list.size());
                }).toList();
    }

    private MyRecordSummaryResponse.Habit habit(User user, List<GroupSessionAttendance> items) {
        long weeks = Math.max(1, ChronoUnit.WEEKS.between(startOfWeek(user.getCreatedAt().toLocalDate()), startOfWeek(LocalDate.now())) + 1);
        double average = Math.round(items.size() * 10.0 / weeks) / 10.0;
        Set<LocalDate> activeWeeks = items.stream().map(item -> startOfWeek(participationAt(item).toLocalDate())).collect(Collectors.toSet());
        int streak = 0; LocalDate week = startOfWeek(LocalDate.now());
        while (activeWeeks.contains(week)) { streak++; week = week.minusWeeks(1); }
        String day = mostFrequent(items, item -> participationAt(item).getDayOfWeek().name());
        String time = mostFrequent(items, item -> timeRange(item.getSession().getStartsAt().getHour()));
        return new MyRecordSummaryResponse.Habit(average, streak, day, time);
    }

    private MyRecordSummaryResponse.PlayStyleStats playStyle(List<MatchPlayer> matches) {
        if (matches.isEmpty()) return new MyRecordSummaryResponse.PlayStyleStats(0, 0, 0, 0, 0, 0, 0, false);
        List<MatchPlayer> ordered = matches.stream().sorted(Comparator.comparing(item -> item.getMatch().getPlayedAt())).toList();
        long totalRest = 0; int restCount = 0; int consecutive = 0;
        for (int i = 1; i < ordered.size(); i++) {
            MatchRecord previous = ordered.get(i - 1).getMatch(); MatchRecord current = ordered.get(i).getMatch();
            if (!previous.getSession().getId().equals(current.getSession().getId()) || previous.getEndedAt() == null) continue;
            long minutes = Math.max(0, Duration.between(previous.getEndedAt(), current.getPlayedAt()).toMinutes());
            totalRest += minutes; restCount++; if (minutes <= 5) consecutive++;
        }
        int close = (int) matches.stream().filter(item -> scoreGap(item) <= 3).count();
        int blowoutWin = (int) matches.stream().filter(item -> scoreGap(item) >= 7 && won(item)).count();
        int blowoutLoss = (int) matches.stream().filter(item -> scoreGap(item) >= 7 && !won(item)).count();
        int fun = (int) matches.stream().filter(item -> item.getMatch().getPlayStyle() == PlayStyle.FUN).count();
        int competitive = (int) matches.stream().filter(item -> item.getMatch().getPlayStyle() == PlayStyle.COMPETITIVE).count();
        return new MyRecordSummaryResponse.PlayStyleStats(restCount == 0 ? 0 : Math.round((double) totalRest / restCount),
                rate(consecutive, restCount), rate(close, matches.size()), rate(blowoutWin, matches.size()),
                rate(blowoutLoss, matches.size()), rate(fun, matches.size()), rate(competitive, matches.size()), matches.size() >= 3);
    }

    private List<MyRecordSummaryResponse.GroupStats> groupStats(List<MatchPlayer> matches, List<GroupSessionAttendance> attendance) {
        Set<Long> ids = new HashSet<>(); matches.forEach(item -> ids.add(item.getMatch().getSession().getGroup().getId()));
        attendance.forEach(item -> ids.add(item.getSession().getGroup().getId()));
        return ids.stream().map(id -> {
            List<MatchPlayer> groupMatches = matches.stream().filter(item -> item.getMatch().getSession().getGroup().getId().equals(id)).toList();
            List<GroupSessionAttendance> groupAttendance = attendance.stream().filter(item -> item.getSession().getGroup().getId().equals(id)).toList();
            String name = !groupMatches.isEmpty() ? groupMatches.get(0).getMatch().getSession().getGroup().getName() : groupAttendance.get(0).getSession().getGroup().getName();
            int wins = (int) groupMatches.stream().filter(this::won).count();
            LocalDateTime last = groupAttendance.stream().map(this::participationAt).max(Comparator.naturalOrder()).orElse(null);
            return new MyRecordSummaryResponse.GroupStats(id, name, groupAttendance.size(), groupMatches.size(), wins,
                    groupMatches.size() - wins, rate(wins, groupMatches.size()), last);
        }).sorted(Comparator.comparing(MyRecordSummaryResponse.GroupStats::lastParticipationAt,
                Comparator.nullsLast(Comparator.reverseOrder()))).toList();
    }

    private MyRecordSummaryResponse.Highlights highlights(List<MatchPlayer> matches) {
        MatchPlayer closest = matches.stream().min(Comparator.comparingInt(this::scoreGap)
                .thenComparing(item -> item.getMatch().getPlayedAt(), Comparator.reverseOrder())).orElse(null);
        Streak win = longestStreak(matches, true); Streak loss = longestStreak(matches, false);
        return new MyRecordSummaryResponse.Highlights(closest == null ? null : new MyRecordSummaryResponse.Highlight(matchItem(closest), 1),
                win.player == null ? null : new MyRecordSummaryResponse.Highlight(matchItem(win.player), win.count),
                loss.player == null ? null : new MyRecordSummaryResponse.Highlight(matchItem(loss.player), loss.count));
    }

    private Streak longestStreak(List<MatchPlayer> matches, boolean targetWin) {
        List<MatchPlayer> ordered = matches.stream().sorted(Comparator.comparing(item -> item.getMatch().getPlayedAt())).toList();
        int current = 0, best = 0; MatchPlayer bestPlayer = null;
        for (MatchPlayer player : ordered) { if (won(player) == targetWin) { current++; if (current >= best) { best = current; bestPlayer = player; } } else current = 0; }
        return new Streak(best, bestPlayer);
    }

    private MyRecordSummaryResponse.MatchItem matchItem(MatchPlayer me) {
        MatchRecord match = me.getMatch();
        String partner = match.getPlayers().stream()
                .filter(item -> item.getTeamNumber() == me.getTeamNumber())
                .filter(item -> !samePlayer(item, me))
                .map(this::displayName).findFirst().orElse("-");
        List<String> opponents = match.getPlayers().stream().filter(item -> item.getTeamNumber() != me.getTeamNumber()).map(this::displayName).toList();
        return new MyRecordSummaryResponse.MatchItem(match.getId(), match.getMatchType().name(), match.getPlayedAt(), won(me), myScore(me), opponentScore(me),
                partner, opponents, match.getSession().getGroup().getId(), match.getSession().getGroup().getName(), match.getSession().getId(), match.getSession().getTitle());
    }

    private PersonKey personKey(MatchPlayer player) {
        if (player.getUser() != null) {
            return new PersonKey(player.getUser().getId(), player.getUser().getName(), player.getUser().getProfileImageUrl());
        }
        long guestKey = player.getAttendance() != null && player.getAttendance().getGuest() != null
                ? -player.getAttendance().getGuest().getId()
                : -player.getId();
        return new PersonKey(guestKey, displayName(player), null);
    }

    private String displayName(MatchPlayer player) {
        if (player.getUser() != null) return player.getUser().getName();
        return player.displayName();
    }

    private boolean samePlayer(MatchPlayer left, MatchPlayer right) {
        if (left == right) return true;
        if (left.getId() != null && right.getId() != null && left.getId() > 0 && right.getId() > 0) {
            return Objects.equals(left.getId(), right.getId());
        }
        if (left.getUser() != null && right.getUser() != null
                && left.getUser().getId() != null && right.getUser().getId() != null
                && left.getUser().getId() > 0 && right.getUser().getId() > 0) {
            return Objects.equals(left.getUser().getId(), right.getUser().getId());
        }
        return false;
    }

    private List<MatchPlayer> filterMatches(List<MatchPlayer> source, LocalDateTime from, LocalDateTime to) { return source.stream().filter(item -> !item.getMatch().getPlayedAt().isBefore(from) && item.getMatch().getPlayedAt().isBefore(to)).toList(); }
    private List<GroupSessionAttendance> filterAttendance(List<GroupSessionAttendance> source, LocalDateTime from, LocalDateTime to) { return source.stream().filter(item -> !participationAt(item).isBefore(from) && participationAt(item).isBefore(to)).toList(); }
    private int mmrChange(Long userId, MmrType type, LocalDateTime from, LocalDateTime to) { return mmrHistories.findAllByUserIdAndMmrTypeAndChangedAtBetweenAndIsDeletedFalseOrderByChangedAtAsc(userId, type, from, to).stream().mapToInt(item -> item.getAfterMmr() - item.getBeforeMmr()).sum(); }
    private boolean won(MatchPlayer item) { return item.getTeamNumber() == 1 ? item.getMatch().getTeamAScore() > item.getMatch().getTeamBScore() : item.getMatch().getTeamBScore() > item.getMatch().getTeamAScore(); }
    private int myScore(MatchPlayer item) { return item.getTeamNumber() == 1 ? item.getMatch().getTeamAScore() : item.getMatch().getTeamBScore(); }
    private int opponentScore(MatchPlayer item) { return item.getTeamNumber() == 1 ? item.getMatch().getTeamBScore() : item.getMatch().getTeamAScore(); }
    private int scoreGap(MatchPlayer item) { return Math.abs(item.getMatch().getTeamAScore() - item.getMatch().getTeamBScore()); }
    private int rate(int value, int total) { return total == 0 ? 0 : Math.round(value * 100f / total); }
    private long exerciseMinutes(GroupSessionAttendance item) { LocalDateTime start = item.getSession().getStartsAt(); LocalDateTime end = item.getSession().getEndsAt(); return end == null || end.isBefore(start) ? 0 : Duration.between(start, end).toMinutes(); }
    private LocalDateTime participationAt(GroupSessionAttendance item) { return item.getArrivedAt() == null ? item.getSession().getStartsAt() : item.getArrivedAt(); }
    private LocalDate startOfWeek(LocalDate date) { return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)); }
    private String timeRange(int hour) { int start = (hour / 2) * 2; return String.format("%02d:00~%02d:00", start, (start + 2) % 24); }
    private <T> String mostFrequent(List<T> items, java.util.function.Function<T, String> classifier) { return items.stream().collect(Collectors.groupingBy(classifier, Collectors.counting())).entrySet().stream().max(Map.Entry.<String, Long>comparingByValue().thenComparing(Map.Entry::getKey)).map(Map.Entry::getKey).orElse("-"); }
    private String value(Enum<?> value) { return value == null ? null : value.name(); }
    private User findUser(Long id) { return users.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND)); }
    private record Streak(int count, MatchPlayer player) {}
    private record PersonKey(Long userId, String name, String profileImageUrl) {}
}
