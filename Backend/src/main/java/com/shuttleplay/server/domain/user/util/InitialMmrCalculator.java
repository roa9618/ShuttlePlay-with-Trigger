package com.shuttleplay.server.domain.user.util;

import com.shuttleplay.server.domain.user.enums.Grade;

public final class InitialMmrCalculator {
    private InitialMmrCalculator() {
    }

    public static int calculate(Grade grade) {
        return grade.getInitialMmr();
    }
}