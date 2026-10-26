
package com.vehicle.service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final long EXPIRATION_TIME = 86_400_000L;

    private final SecretKey secretKey;

    public JwtService(
            @Value("${app.jwt.secret}") String secret) {

        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    // =====================================
    // GENERATE CUSTOMER TOKEN
    // =====================================

    public String generateToken(Long customerId) {
        return createToken(String.valueOf(customerId));
    }

    // =====================================
    // GENERATE ADMIN TOKEN
    // =====================================

    public String generateAdminToken(Long adminId) {
        return createToken("ADMIN:" + adminId);
    }

    // =====================================
    // GENERATE TECHNICIAN TOKEN
    // =====================================

    public String generateTechnicianToken(Long technicianId) {
        return createToken("TECHNICIAN:" + technicianId);
    }

    // =====================================
    // COMMON TOKEN GENERATOR
    // =====================================

    private String createToken(String subject) {

        Date now = new Date();

        Date expiry = new Date(
                now.getTime() + EXPIRATION_TIME
        );

        return Jwts.builder()
                .subject(subject)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    // =====================================
    // EXTRACT JWT CLAIMS
    // =====================================

    private Claims extractClaims(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // =====================================
    // EXTRACT SUBJECT
    // =====================================

    public String extractSubject(String token) {
        return extractClaims(token).getSubject();
    }

    // =====================================
    // EXTRACT CUSTOMER ID
    // =====================================

    public Long extractCustomerId(String token) {

        String subject = extractSubject(token);

        if (subject == null ||
                !subject.matches("[0-9]+")) {

            throw new IllegalArgumentException(
                    "Token does not belong to a customer"
            );
        }

        return Long.parseLong(subject);
    }

    // =====================================
    // VALIDATE TOKEN
    // =====================================

    public boolean isTokenValid(String token) {

        if (token == null || token.isBlank()) {
            return false;
        }

        try {
            Claims claims = extractClaims(token);

            Date expiration = claims.getExpiration();

            return claims.getSubject() != null
                    && !claims.getSubject().isBlank()
                    && expiration != null
                    && expiration.after(new Date());

        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
