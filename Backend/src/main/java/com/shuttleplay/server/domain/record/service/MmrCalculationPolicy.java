package com.shuttleplay.server.domain.record.service;

import com.shuttleplay.server.domain.group.enums.GroupSessionType;
import com.shuttleplay.server.domain.record.enums.PlayStyle;
import com.shuttleplay.server.domain.user.enums.Grade;
import org.springframework.stereotype.Component;

@Component
public class MmrCalculationPolicy {
    public Result calculate(Input input) {
        double expected = 1.0 / (1.0 + Math.pow(10, (input.opponentTeamMmr() - input.ownTeamMmr()) / 400.0));
        double scoreMultiplier = input.scoreEntered() ? scoreMultiplier(input.scoreGap()) : 1.0;
        double confidenceMultiplier = confidenceMultiplier(input.priorMatchCount());
        double teamGapMultiplier = teamGapMultiplier(input.playerMmr(), input.partnerMmr(), input.won());
        double responsibilityMultiplier = Math.abs(input.playerMmr() - input.partnerMmr()) >= 600 ? .8 : 1.0;
        int k = kValue(input.sessionType(), input.playStyle(), input.scoreEntered());

        double actual = input.won() ? 1.0 : 0.0;
        int delta = (int) Math.round(k * (actual - expected) * scoreMultiplier
                * confidenceMultiplier * teamGapMultiplier * responsibilityMultiplier);
        boolean softCapApplied = false;
        if (delta > 0 && input.grade() != null) {
            int softCap = input.grade().getSoftCapMmr();
            if (input.playerMmr() >= softCap) {
                delta = (int) Math.round(delta * .25);
                softCapApplied = true;
            } else if (input.playerMmr() >= softCap - 50) {
                delta = (int) Math.round(delta * .5);
                softCapApplied = true;
            }
        }

        boolean floorApplied = false;
        if (input.grade() != null && input.playerMmr() + delta < input.grade().getFloorMmr()) {
            delta = input.grade().getFloorMmr() - input.playerMmr();
            floorApplied = true;
        }
        return new Result(delta, k, expected, scoreMultiplier, confidenceMultiplier,
                teamGapMultiplier, responsibilityMultiplier, floorApplied, softCapApplied);
    }

    public int kValue(GroupSessionType sessionType, PlayStyle playStyle, boolean scoreEntered) {
        if (sessionType == GroupSessionType.EXCHANGE || sessionType == GroupSessionType.TOURNAMENT) return 12;
        if (playStyle == PlayStyle.FUN) return 6;
        if (playStyle == PlayStyle.COMPETITIVE) return 10;
        return scoreEntered ? 10 : 8;
    }

    public double scoreMultiplier(int gap) {
        if (gap <= 2) return .7;
        if (gap <= 5) return .85;
        if (gap <= 9) return 1.0;
        if (gap <= 14) return 1.15;
        return 1.3;
    }

    public double confidenceMultiplier(long priorMatchCount) {
        if (priorMatchCount <= 5) return .5;
        if (priorMatchCount <= 15) return .75;
        return 1.0;
    }

    public double teamGapMultiplier(int playerMmr, int partnerMmr, boolean won) {
        if (won || playerMmr <= partnerMmr) return 1.0;
        int gap = playerMmr - partnerMmr;
        if (gap <= 200) return 1.0;
        if (gap <= 400) return .8;
        if (gap <= 600) return .6;
        return .4;
    }

    public record Input(int playerMmr, int partnerMmr, double ownTeamMmr, double opponentTeamMmr,
                        boolean won, boolean scoreEntered, int scoreGap, long priorMatchCount,
                        Grade grade, GroupSessionType sessionType, PlayStyle playStyle) {}

    public record Result(int delta, int baseK, double expectedWinRate, double scoreMultiplier,
                         double confidenceMultiplier, double teamGapMultiplier,
                         double responsibilityMultiplier, boolean floorApplied,
                         boolean softCapApplied) {}
}
