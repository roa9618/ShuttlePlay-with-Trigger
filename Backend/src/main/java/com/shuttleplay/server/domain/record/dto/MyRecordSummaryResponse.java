package com.shuttleplay.server.domain.record.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record MyRecordSummaryResponse(
        Profile profile,
        MmrOverview mmr,
        PeriodStats today,
        PeriodStats month,
        List<ActivityDay> activity,
        List<MatchItem> recentMatches,
        People people,
        Habit habit,
        PlayStyleStats playStyle,
        List<GroupStats> groups,
        Highlights highlights
) {
    public record Profile(String name, String profileImageUrl, String gender, String ageGroup, String grade) {}
    public record MmrOverview(int doubles, int mixed, int doublesMonthlyChange, int mixedMonthlyChange) {}
    public record PeriodStats(boolean hasRecord, int matches, int wins, int losses, int winRate,
                              int pointsFor, int pointsAgainst, long exerciseMinutes,
                              int attendance, int doublesMmrChange, int mixedMmrChange) {}
    public record ActivityDay(LocalDate date, int count, long exerciseMinutes, List<ActivityItem> schedules) {}
    public record ActivityItem(String groupName, String sessionTitle, LocalDateTime startsAt, LocalDateTime endsAt) {}
    public record MatchItem(Long id, String matchType, LocalDateTime playedAt, boolean win,
                            int myScore, int opponentScore, String partner, List<String> opponents,
                            Long groupId, String groupName, Long sessionId, String sessionTitle) {}
    public record Person(Long userId, String name, String profileImageUrl, int matches) {}
    public record People(List<Person> partners, List<Person> opponents) {}
    public record Habit(double averageWeeklySessions, int consecutiveWeeks, String favoriteDay, String favoriteTimeRange) {}
    public record PlayStyleStats(long averageRestMinutes, int consecutiveMatchRate, int closeMatchRate,
                                 int blowoutWinRate, int blowoutLossRate, int funRate, int competitiveRate,
                                 boolean enoughData) {}
    public record GroupStats(Long groupId, String groupName, int attendance, int matches, int wins,
                             int losses, int winRate, LocalDateTime lastParticipationAt) {}
    public record Highlight(MatchItem match, int count) {}
    public record Highlights(Highlight closestMatch, Highlight longestWinStreak, Highlight longestLossStreak) {}
}
