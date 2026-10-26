package com.vehicle.service.controller;

import com.vehicle.service.entity.ServiceCompletion;
import com.vehicle.service.service.ServiceCompletionService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/technician")
public class ServiceCompletionController {

    private final ServiceCompletionService completionService;

    public ServiceCompletionController(
            ServiceCompletionService completionService) {
        this.completionService = completionService;
    }

    @PostMapping("/bookings/{bookingId}/complete")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceCompletion complete(
            @PathVariable Long bookingId,
            @RequestBody CompletionRequest request,
            Authentication authentication) {

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof Long technicianId) ||
                authentication.getAuthorities().stream()
                        .noneMatch(a -> a.getAuthority()
                                .equals("ROLE_TECHNICIAN"))) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Technician login required");
        }

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Completion details are required");
        }

        return completionService.completeService(
                bookingId,
                technicianId,
                request.workPerformed(),
                request.technicianNotes()
        );
    }

    public record CompletionRequest(
            String workPerformed,
            String technicianNotes
    ) {}
}