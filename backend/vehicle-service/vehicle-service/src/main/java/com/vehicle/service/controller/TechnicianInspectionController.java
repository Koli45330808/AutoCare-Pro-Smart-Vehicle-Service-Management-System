package com.vehicle.service.controller;

import com.vehicle.service.entity.TechnicianAssignment;
import com.vehicle.service.entity.VehicleInspection;
import com.vehicle.service.repository.TechnicianAssignmentRepository;
import com.vehicle.service.service.VehicleInspectionService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/technician/jobs")
public class TechnicianInspectionController {

    private final TechnicianAssignmentRepository assignments;
    private final VehicleInspectionService inspectionService;

    public TechnicianInspectionController(
            TechnicianAssignmentRepository assignments,
            VehicleInspectionService inspectionService) {
        this.assignments = assignments;
        this.inspectionService = inspectionService;
    }

    @PostMapping("/{bookingId}/inspection")
    @ResponseStatus(HttpStatus.CREATED)
    public VehicleInspection createInspection(
            @PathVariable Long bookingId,
            @RequestBody InspectionRequest request,
            Authentication authentication) {

        if (authentication == null
                || !(authentication.getPrincipal() instanceof Long)
                || authentication.getAuthorities().stream()
                    .noneMatch(a -> a.getAuthority()
                            .equals("ROLE_TECHNICIAN"))) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Technician authentication required");
        }

        Long technicianId = (Long) authentication.getPrincipal();

        TechnicianAssignment assignment = assignments
                .findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Assigned job not found"));

        if (!technicianId.equals(assignment.getTechnicianId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Assigned job not found");
        }

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Inspection details required");
        }

        VehicleInspection inspection = new VehicleInspection();
        inspection.setBookingId(bookingId);
        inspection.setTechnicianId(technicianId);
        inspection.setEngineCondition(request.engineCondition());
        inspection.setBrakeCondition(request.brakeCondition());
        inspection.setTyreCondition(request.tyreCondition());
        inspection.setBatteryCondition(request.batteryCondition());
        inspection.setTechnicianNotes(request.technicianNotes());

        return inspectionService.createInspection(inspection);
    }

    public record InspectionRequest(
            String engineCondition,
            String brakeCondition,
            String tyreCondition,
            String batteryCondition,
            String technicianNotes
    ) {}
}