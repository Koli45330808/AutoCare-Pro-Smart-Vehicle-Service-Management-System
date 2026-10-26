
package com.vehicle.service.controller;

import com.vehicle.service.dto.CustomerRegisterRequest;
import com.vehicle.service.service.CustomerAuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class CustomerAuthController {

    private final CustomerAuthService authService;

    public CustomerAuthController(
            CustomerAuthService authService) {
        this.authService = authService;
    }

    // CUSTOMER REGISTRATION
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(
            @Valid @RequestBody CustomerRegisterRequest request) {

        Long customerId = authService.register(request);

        return Map.of(
                "message", "Customer registered successfully",
                "customerId", customerId
        );
    }

    // CUSTOMER LOGIN
    @PostMapping("/login")
    public Map<String, Object> login(
            @RequestBody Map<String, String> request) {

        return authService.login(
                request.get("email"),
                request.get("password")
        );
    }
}
