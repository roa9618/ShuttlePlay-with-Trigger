package com.shuttleplay.server.domain.user.enums;

import lombok.Getter;

@Getter
public enum Grade {
    E(800),
    D(950),
    C(1100),
    B(1250),
    A(1400),
    S(1550),
    SS(1700);

    private final int initialMmr;

    Grade(int initialMmr) {
        this.initialMmr = initialMmr;
    }
}