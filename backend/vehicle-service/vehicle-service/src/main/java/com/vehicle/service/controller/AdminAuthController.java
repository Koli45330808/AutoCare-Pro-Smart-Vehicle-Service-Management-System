
package com.vehicle.service.controller;

import com.vehicle.service.dto.AdminLoginRequest;
import com.vehicle.service.service.AdminAuthService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(
            AdminAuthService adminAuthService) {

        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public Map<String, Object> login(
            @Valid @RequestBody AdminLoginRequest request) {

        return adminAuthService.login(request);
    }
}
