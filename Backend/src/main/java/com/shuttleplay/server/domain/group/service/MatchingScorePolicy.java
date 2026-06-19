package com.shuttleplay.server.domain.group.service;

import org.springframework.stereotype.Component;

@Component
public class MatchingScorePolicy {
    public int teamBalancePenalty(double gap) { if (gap <= 50) return 0; if (gap <= 100) return 5; if (gap <= 150) return 10; if (gap <= 250) return 20; return 35; }
    public int teamInternalPenalty(int gap) { if (gap <= 200) return 0; if (gap <= 400) return 5; if (gap <= 600) return 10; return 15; }
    public int matchCountPenalty(long gap) { if (gap == 0) return 0; if (gap == 1) return 10; if (gap == 2) return 30; return 80; }
    public int consecutivePenalty(int count) { if (count <= 0) return 0; if (count == 1) return 80; if (count == 2) return 400; return 2000; }
    public int restBonus(int count) { if (count <= 0) return 0; if (count == 1) return 5; if (count == 2) return 30; return 50; }
    public int duplicatePartnerPenalty(int count) { if (count <= 0) return 0; if (count == 1) return 120; if (count == 2) return 260; return 500; }
    public int duplicateOpponentPenalty(int count) { if (count <= 0) return 0; if (count == 1) return 70; if (count == 2) return 160; return 320; }
    public int scheduledLoadPenalty(long count) { if (count <= 0) return 0; if (count == 1) return 90; if (count == 2) return 220; return 500; }
    public int mixedSplitPenalty() { return 1000; }
    public int ageAdjustment(String ageGroup) { return switch (ageGroup) { case "FORTIES" -> -15; case "FIFTIES" -> -35; case "SIXTIES_AND_ABOVE" -> -60; default -> 0; }; }
}
