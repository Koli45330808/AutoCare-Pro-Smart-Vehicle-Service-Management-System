package com.vehicle.service.controller;

import com.vehicle.service.entity.VehicleDiagnosis;
import com.vehicle.service.entity.TechnicianAssignment;
import com.vehicle.service.repository.TechnicianAssignmentRepository;
import com.vehicle.service.service.VehicleDiagnosisService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/technician/jobs")
public class TechnicianDiagnosisController {

    private final VehicleDiagnosisService diagnosisService;
    private final TechnicianAssignmentRepository assignmentRepository;

    public TechnicianDiagnosisController(
            VehicleDiagnosisService diagnosisService,
            TechnicianAssignmentRepository assignmentRepository) {
        this.diagnosisService = diagnosisService;
        this.assignmentRepository = assignmentRepository;
    }

    public record DiagnosisRequest(
            String problemFound,
            String recommendedRepair,
            String additionalNotes
    ) {}

    @PostMapping("/{bookingId}/diagnosis")
    @ResponseStatus(HttpStatus.CREATED)
    public VehicleDiagnosis createDiagnosis(
            @PathVariable Long bookingId,
            @RequestBody DiagnosisRequest request,
            Authentication authentication) {

        if (authentication == null
                || !(authentication.getPrincipal() instanceof Long)
                || authentication.getAuthorities().stream()
                    .noneMatch(a -> "ROLE_TECHNICIAN"
                            .equals(a.getAuthority()))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Technician authentication required"
            );
        }

        Long technicianId = (Long) authentication.getPrincipal();

        TechnicianAssignment assignment = assignmentRepository
                .findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Assigned job not found"
                ));

        if (!technicianId.equals(assignment.getTechnicianId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This job is not assigned to you"
            );
        }

        VehicleDiagnosis diagnosis = new VehicleDiagnosis();
        diagnosis.setBookingId(bookingId);
        diagnosis.setTechnicianId(technicianId);
        diagnosis.setProblemFound(request.problemFound());
        diagnosis.setRecommendedRepair(request.recommendedRepair());
        diagnosis.setAdditionalNotes(request.additionalNotes());

        return diagnosisService.create(diagnosis);
    }
}