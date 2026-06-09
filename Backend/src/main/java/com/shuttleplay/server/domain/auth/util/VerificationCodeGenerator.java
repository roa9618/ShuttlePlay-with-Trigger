package com.shuttleplay.server.domain.auth.util;

import java.security.SecureRandom;

public final class VerificationCodeGenerator {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int CODE_BOUND = 1_000_000;

    private VerificationCodeGenerator() {
    }

    public static String generate() {
        int code = SECURE_RANDOM.nextInt(CODE_BOUND);

        return String.format("%06d", code);
    }
}