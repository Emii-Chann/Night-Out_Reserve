package com.nightout_reserve.backend.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String SECRET_KEY; // Injected after construction
    private SecretKey key; // Initialized in @PostConstruct
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours

    @PostConstruct
    public void init() {
        if (SECRET_KEY == null || SECRET_KEY.length() < 32) {
            throw new IllegalArgumentException("JWT secret key must be at least 32 characters long");
        }
        this.key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generateToken(String username, Integer userId) {
        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    public Integer getUserIdFromToken(String token) {
        return getClaimsFromToken(token).get("userId", Integer.class);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parse(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}