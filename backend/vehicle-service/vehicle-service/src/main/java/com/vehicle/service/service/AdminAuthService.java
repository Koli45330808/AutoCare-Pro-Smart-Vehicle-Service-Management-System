package com.vehicle.service.service;

import com.vehicle.service.dto.AdminLoginRequest;
import com.vehicle.service.entity.Admin;
import com.vehicle.service.repository.AdminRepository;
import com.vehicle.service.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Locale;
import java.util.Map;

@Service
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminAuthService(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Map<String, Object> login(AdminLoginRequest request) {
        String email = request.email().trim()
                .toLowerCase(Locale.ROOT);

        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        if (!passwordEncoder.matches(
                request.password(), admin.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        return Map.of(
                "token", jwtService.generateAdminToken(admin.getId()),
                "adminId", admin.getId(),
                "name", admin.getName(),
                "email", admin.getEmail(),
                "role", "ADMIN"
        );
    }
}