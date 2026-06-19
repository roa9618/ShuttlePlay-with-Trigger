package com.shuttleplay.server.domain.record.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.shuttleplay.server.domain.group.enums.GroupSessionType;
import com.shuttleplay.server.domain.record.enums.PlayStyle;
import com.shuttleplay.server.domain.user.enums.Grade;
import org.junit.jupiter.api.Test;

class MmrCalculationPolicyTest {
    private final MmrCalculationPolicy policy = new MmrCalculationPolicy();

    @Test
    void followsDocumentedKPriority() {
        assertThat(policy.kValue(GroupSessionType.EXCHANGE, PlayStyle.FUN, false)).isEqualTo(12);
        assertThat(policy.kValue(GroupSessionType.REGULAR, PlayStyle.FUN, true)).isEqualTo(6);
        assertThat(policy.kValue(GroupSessionType.REGULAR, PlayStyle.COMPETITIVE, false)).isEqualTo(10);
        assertThat(policy.kValue(GroupSessionType.REGULAR, PlayStyle.GENERAL, false)).isEqualTo(8);
        assertThat(policy.kValue(GroupSessionType.REGULAR, PlayStyle.GENERAL, true)).isEqualTo(10);
    }

    @Test
    void appliesScoreConfidenceTeamGapAndGradeFloor() {
        var result = policy.calculate(new MmrCalculationPolicy.Input(
                500, 1200, 850, 1100, false, true, 15, 3,
                Grade.E, GroupSessionType.REGULAR, PlayStyle.COMPETITIVE));
        assertThat(result.baseK()).isEqualTo(10);
        assertThat(result.scoreMultiplier()).isEqualTo(1.3);
        assertThat(result.confidenceMultiplier()).isEqualTo(.5);
        assertThat(result.responsibilityMultiplier()).isEqualTo(.8);
        assertThat(result.delta()).isGreaterThanOrEqualTo(0);
        assertThat(result.floorApplied()).isTrue();
    }

    @Test
    void appliesDocumentedHigherPlayerLossReduction() {
        assertThat(policy.teamGapMultiplier(1300, 1000, false)).isEqualTo(.8);
        assertThat(policy.teamGapMultiplier(1500, 1000, false)).isEqualTo(.6);
        assertThat(policy.teamGapMultiplier(1700, 1000, false)).isEqualTo(.4);
    }
}
