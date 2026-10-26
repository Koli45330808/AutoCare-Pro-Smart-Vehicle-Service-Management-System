
package com.vehicle.service.controller;

import com.vehicle.service.entity.TechnicianAssignment;
import com.vehicle.service.service.TechnicianAssignmentService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "http://localhost:5173")
public class TechnicianAssignmentController {

    private final TechnicianAssignmentService assignmentService;

    public TechnicianAssignmentController(
            TechnicianAssignmentService assignmentService
    ) {
        this.assignmentService = assignmentService;
    }

    // Admin assigns a technician
    @PostMapping
    public TechnicianAssignment assignTechnician(
            @Valid @RequestBody AssignmentRequest request
    ) {
        return assignmentService.assignTechnician(
                request.bookingId(),
                request.technicianId()
        );
    }

    // Admin views all assignments
    @GetMapping
    public List<TechnicianAssignment> getAllAssignments() {
        return assignmentService.getAllAssignments();
    }

    // Technician views assigned jobs
    @GetMapping("/technician/{technicianId}")
    public List<TechnicianAssignment> getTechnicianJobs(
            @PathVariable Long technicianId
    ) {
        return assignmentService.getTechnicianJobs(technicianId);
    }

    // Find assignment by booking
    @GetMapping("/booking/{bookingId}")
    public TechnicianAssignment getAssignmentByBooking(
            @PathVariable Long bookingId
    ) {
        return assignmentService.getAssignmentByBookingId(bookingId);
    }

    public record AssignmentRequest(
            @NotNull @Positive Long bookingId,
            @NotNull @Positive Long technicianId
    ) {}
}
