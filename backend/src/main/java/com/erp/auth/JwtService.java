package com.erp.auth;

import com.erp.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long accessTokenExpiry;
    private final long refreshTokenExpiry;
    private final StringRedisTemplate redisTemplate;

    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiry}") long accessTokenExpiry,
            @Value("${app.jwt.refresh-token-expiry}") long refreshTokenExpiry,
            StringRedisTemplate redisTemplate
    ) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessTokenExpiry = accessTokenExpiry;
        this.refreshTokenExpiry = refreshTokenExpiry;
        this.redisTemplate = redisTemplate;
    }

    public String generateAccessToken(User user) {
        return buildToken(user, accessTokenExpiry, Map.of(
                "role", user.getRole().name(),
                "name", user.getFullName()
        ));
    }

    public String generateRefreshTokenValue() {
        return UUID.randomUUID().toString();
    }

    public long getRefreshTokenExpiryMs() {
        return refreshTokenExpiry;
    }

    private String buildToken(User user, long expiryMs, Map<String, Object> extraClaims) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiryMs);

        var builder = Jwts.builder()
                .subject(user.getId().toString())
                .issuedAt(now)
                .expiration(expiry);

        extraClaims.forEach(builder::claim);

        return builder.signWith(signingKey).compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseToken(token);
            boolean expired = claims.getExpiration().before(new Date());
            boolean blacklisted = isBlacklisted(token);
            return !expired && !blacklisted;
        } catch (ExpiredJwtException e) {
            return false;
        } catch (Exception e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseToken(token).getSubject());
    }

    public String extractRole(String token) {
        return parseToken(token).get("role", String.class);
    }

    // --- Redis blacklist ---

    public void blacklistToken(String token) {
        try {
            Claims claims = parseToken(token);
            long ttlMs = claims.getExpiration().getTime() - System.currentTimeMillis();
            if (ttlMs > 0) {
                redisTemplate.opsForValue().set(
                        BLACKLIST_PREFIX + token, "1", ttlMs, TimeUnit.MILLISECONDS
                );
            }
        } catch (ExpiredJwtException e) {
            // Already expired — no need to blacklist
        } catch (Exception e) {
            log.error("Error blacklisting token", e);
        }
    }

    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
    }
}
