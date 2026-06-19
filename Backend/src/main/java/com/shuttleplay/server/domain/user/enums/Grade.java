package com.shuttleplay.server.domain.user.enums;

import lombok.Getter;

@Getter
public enum Grade {
    E(700, 500, 900),
    D(950, 750, 1150),
    C(1200, 1000, 1450),
    B(1500, 1250, 1750),
    A(1800, 1500, 2100),
    S(2150, 1800, 2450),
    SS(2500, 2100, 2800);

    private final int initialMmr;
    private final int floorMmr;
    private final int softCapMmr;

    Grade(int initialMmr, int floorMmr, int softCapMmr) {
        this.initialMmr = initialMmr;
        this.floorMmr = floorMmr;
        this.softCapMmr = softCapMmr;
    }
}
