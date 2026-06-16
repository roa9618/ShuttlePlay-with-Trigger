package com.shuttleplay.server.global.security;

import com.shuttleplay.server.domain.user.entity.User;
import com.shuttleplay.server.global.error.BusinessException;
import com.shuttleplay.server.global.error.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {
    private static final String GUEST_SESSION_TOKEN_TYPE = "guest-session";

    private final SecretKey secretKey;
    private final long accessTokenExpirationMillis;
    private final long refreshTokenExpirationMillis;

    public record GuestSessionTokenClaims(Long sessionId, Long guestId) {
    }

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration-millis}") long accessTokenExpirationMillis,
            @Value("${jwt.refresh-token-expiration-millis}") long refreshTokenExpirationMillis
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMillis = accessTokenExpirationMillis;
        this.refreshTokenExpirationMillis = refreshTokenExpirationMillis;
    }

    public String createAccessToken(User user) {
        Date now = new Date();
        Date expiresAt = new Date(now.getTime() + accessTokenExpirationMillis);

        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiration(expiresAt)
                .signWith(secretKey)
                .compact();
    }

    public String createGuestSessionToken(Long sessionId, Long guestId, long expirationMillis) {
        Date now = new Date();
        Date expiresAt = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .claim("type", GUEST_SESSION_TOKEN_TYPE)
                .claim("sessionId", sessionId)
                .claim("guestId", guestId)
                .issuedAt(now)
                .expiration(expiresAt)
                .signWith(secretKey)
                .compact();
    }

    public Optional<GuestSessionTokenClaims> getGuestSessionTokenClaims(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        try {
            Claims claims = parseClaims(token);
            if (!GUEST_SESSION_TOKEN_TYPE.equals(claims.get("type", String.class))) {
                return Optional.empty();
            }

            Long sessionId = longClaim(claims, "sessionId");
            Long guestId = longClaim(claims, "guestId");
            if (sessionId == null || guestId == null) {
                return Optional.empty();
            }

            return Optional.of(new GuestSessionTokenClaims(sessionId, guestId));
        } catch (JwtException | IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    public Long getUserId(String token) {
        Claims claims = parseClaims(token);

        return Long.parseLong(claims.getSubject());
    }

    public LocalDateTime getExpiresAt(String token) {
        Claims claims = parseClaims(token);

        return claims.getExpiration()
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }

    public long getAccessTokenExpirationMillis() {
        return accessTokenExpirationMillis;
    }

    public long getRefreshTokenExpirationMillis() {
        return refreshTokenExpirationMillis;
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);

            return true;
        } catch (ExpiredJwtException exception) {
            throw new BusinessException(ErrorCode.EXPIRED_TOKEN);
        } catch (JwtException | IllegalArgumentException exception) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private static Long longClaim(Claims claims, String name) {
        Object value = claims.get(name);
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.valueOf(String.valueOf(value));
    }
}
