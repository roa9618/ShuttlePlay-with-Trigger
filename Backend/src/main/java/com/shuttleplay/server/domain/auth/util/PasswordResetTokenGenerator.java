package com.shuttleplay.server.domain.auth.util;

import java.security.SecureRandom;
import java.util.Base64;

public final class PasswordResetTokenGenerator {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int TOKEN_BYTE_LENGTH = 64;

    private PasswordResetTokenGenerator() {
    }

    public static String generate() {
        byte[] randomBytes = new byte[TOKEN_BYTE_LENGTH];

        SECURE_RANDOM.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }
}