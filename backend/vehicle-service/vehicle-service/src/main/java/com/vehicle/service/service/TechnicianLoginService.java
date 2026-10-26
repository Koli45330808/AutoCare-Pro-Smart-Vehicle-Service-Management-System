package com.vehicle.service.service;

import com.vehicle.service.dto.TechnicianLoginRequest;
import com.vehicle.service.entity.Technician;
import com.vehicle.service.repository.TechnicianRepository;
import com.vehicle.service.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Map;

@Service
public class TechnicianLoginService {

    private final TechnicianRepository technicianRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public TechnicianLoginService(
            TechnicianRepository technicianRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.technicianRepository = technicianRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Map<String, Object> login(
            TechnicianLoginRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        Technician technician = technicianRepository
                .findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        if (!passwordEncoder.matches(
                request.password(),
                technician.getPasswordHash())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        if (!"APPROVED".equals(
                technician.getApprovalStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Technician account is not approved"
            );
        }

        return Map.of(
                "token",
                jwtService.generateTechnicianToken(
                        technician.getId()),
                "technicianId", technician.getId(),
                "name", technician.getName(),
                "email", technician.getEmail(),
                "role", "TECHNICIAN",
                "approvalStatus", technician.getApprovalStatus()
        );
    }
}