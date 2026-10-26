
package com.vehicle.service.controller;

import com.vehicle.service.dto.TechnicianLoginRequest;
import com.vehicle.service.dto.TechnicianRegisterRequest;
import com.vehicle.service.service.TechnicianAuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/technician/auth")
public class TechnicianAuthController {

    private final TechnicianAuthService authService;

    public TechnicianAuthController(
            TechnicianAuthService authService) {

        this.authService = authService;
    }

    // TECHNICIAN REGISTRATION
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(
            @Valid @RequestBody TechnicianRegisterRequest request) {

        Long technicianId = authService.register(request);

        return Map.of(
                "message", "Registration submitted for admin approval",
                "technicianId", technicianId,
                "approvalStatus", "PENDING"
        );
    }

    // TECHNICIAN LOGIN
    @PostMapping("/login")
    public Map<String, Object> login(
            @Valid @RequestBody TechnicianLoginRequest request) {

        return authService.login(request);
    }
}
