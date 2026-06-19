package com.shuttleplay.server.global.util;

import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;

public final class PublicIdCodec {
    private static final String PREFIX = "sp";
    private static final long MULTIPLIER = 7919L;
    private static final long OFFSET = 104729L;
    private static final long CHECK_MOD = 1296L;

    private PublicIdCodec() {}

    public static String encode(Long id) {
        if (id == null || id <= 0) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        long mixed = id * MULTIPLIER + OFFSET;
        return PREFIX + Long.toString(mixed, 36) + checksum(mixed);
    }

    public static Long decode(String value) {
        if (value == null || value.isBlank()) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        String trimmed = value.trim();
        if (trimmed.chars().allMatch(Character::isDigit)) return Long.valueOf(trimmed);
        String lower = trimmed.toLowerCase();
        if (!lower.startsWith(PREFIX) || lower.length() <= PREFIX.length() + 2) throw new BusinessException(ErrorCode.INVALID_REQUEST);
        String payload = lower.substring(PREFIX.length(), lower.length() - 2);
        String checksum = lower.substring(lower.length() - 2);
        try {
            long mixed = Long.parseLong(payload, 36);
            if (!checksum(mixed).equals(checksum)) throw new BusinessException(ErrorCode.INVALID_REQUEST);
            long shifted = mixed - OFFSET;
            if (shifted <= 0 || shifted % MULTIPLIER != 0) throw new BusinessException(ErrorCode.INVALID_REQUEST);
            return shifted / MULTIPLIER;
        } catch (NumberFormatException exception) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
    }

    private static String checksum(long mixed) {
        return String.format("%2s", Long.toString(Math.floorMod(mixed * 31 + 17, CHECK_MOD), 36))
                .replace(' ', '0');
    }
}
