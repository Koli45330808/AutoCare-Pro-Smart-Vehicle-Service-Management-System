
package com.vehicle.service.service;

import com.vehicle.service.dto.TechnicianLoginRequest;
import com.vehicle.service.dto.TechnicianRegisterRequest;
import com.vehicle.service.entity.Technician;
import com.vehicle.service.repository.TechnicianRepository;
import com.vehicle.service.repository.CustomerRepository;
import com.vehicle.service.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Map;

@Service
public class TechnicianAuthService {

    private final TechnicianRepository technicianRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public TechnicianAuthService(
            TechnicianRepository technicianRepository,
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.technicianRepository = technicianRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // TECHNICIAN REGISTRATION
    @Transactional
    public Long register(TechnicianRegisterRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (technicianRepository.existsByEmail(email)
                || customerRepository.existsByEmail(email)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already registered"
            );
        }

        Technician technician = new Technician();

        technician.setName(request.name().trim());
        technician.setEmail(email);
        technician.setPhone(request.phone().trim());
        technician.setSpecialization(
                request.specialization().trim()
        );

        technician.setPasswordHash(
                passwordEncoder.encode(request.password())
        );

        technician.setRole("TECHNICIAN");
        technician.setApprovalStatus("PENDING");

        return technicianRepository.save(technician).getId();
    }

    // TECHNICIAN LOGIN
    @Transactional(readOnly = true)
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

        if (!"TECHNICIAN".equals(technician.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid technician role"
            );
        }

        if (!"APPROVED".equals(
                technician.getApprovalStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Technician account is not approved"
            );
        }

        String token = jwtService.generateTechnicianToken(
                technician.getId()
        );

        return Map.of(
                "token", token,
                "technicianId", technician.getId(),
                "name", technician.getName(),
                "email", technician.getEmail(),
                "role", "TECHNICIAN",
                "approvalStatus", technician.getApprovalStatus()
        );
    }
}
