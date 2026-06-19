package com.shuttleplay.server.domain.group.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class MatchingScorePolicyTest {
    private final MatchingScorePolicy policy = new MatchingScorePolicy();

    @Test void followsDocumentedBalanceAndInternalGapTables() {
        assertThat(policy.teamBalancePenalty(50)).isZero();
        assertThat(policy.teamBalancePenalty(100)).isEqualTo(5);
        assertThat(policy.teamBalancePenalty(250)).isEqualTo(20);
        assertThat(policy.teamBalancePenalty(251)).isEqualTo(35);
        assertThat(policy.teamInternalPenalty(200)).isZero();
        assertThat(policy.teamInternalPenalty(600)).isEqualTo(10);
        assertThat(policy.teamInternalPenalty(601)).isEqualTo(15);
    }

    @Test void followsParticipationAndDuplicateTables() {
        assertThat(policy.matchCountPenalty(3)).isEqualTo(80);
        assertThat(policy.consecutivePenalty(2)).isEqualTo(400);
        assertThat(policy.consecutivePenalty(3)).isEqualTo(2000);
        assertThat(policy.restBonus(2)).isEqualTo(30);
        assertThat(policy.restBonus(3)).isEqualTo(50);
        assertThat(policy.duplicatePartnerPenalty(3)).isEqualTo(500);
        assertThat(policy.duplicateOpponentPenalty(3)).isEqualTo(320);
        assertThat(policy.scheduledLoadPenalty(2)).isEqualTo(220);
        assertThat(policy.mixedSplitPenalty()).isEqualTo(1000);
    }

    @Test void followsDocumentedAgeAdjustment() {
        assertThat(policy.ageAdjustment("THIRTIES")).isZero();
        assertThat(policy.ageAdjustment("FORTIES")).isEqualTo(-15);
        assertThat(policy.ageAdjustment("FIFTIES")).isEqualTo(-35);
        assertThat(policy.ageAdjustment("SIXTIES_AND_ABOVE")).isEqualTo(-60);
    }
}
