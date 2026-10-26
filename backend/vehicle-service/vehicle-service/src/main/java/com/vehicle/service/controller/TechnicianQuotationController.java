
package com.vehicle.service.controller;

import com.vehicle.service.entity.ServiceQuotation;
import com.vehicle.service.entity.TechnicianAssignment;
import com.vehicle.service.repository.TechnicianAssignmentRepository;
import com.vehicle.service.service.ServiceQuotationService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/technician/jobs")
public class TechnicianQuotationController {

    private final ServiceQuotationService quotationService;
    private final TechnicianAssignmentRepository assignmentRepository;

    public TechnicianQuotationController(
            ServiceQuotationService quotationService,
            TechnicianAssignmentRepository assignmentRepository) {

        this.quotationService = quotationService;
        this.assignmentRepository = assignmentRepository;
    }

    public record QuotationRequest(
            Long diagnosisId,
            BigDecimal partsCost,
            BigDecimal labourCost,
            BigDecimal additionalCharges,
            String description
    ) {}

    // Verify logged-in technician and booking ownership.
    private Long verifyTechnician(
            Long bookingId,
            Authentication authentication) {

        if (authentication == null
                || !(authentication.getPrincipal() instanceof Long)
                || authentication.getAuthorities().stream()
                    .noneMatch(a ->
                        "ROLE_TECHNICIAN".equals(a.getAuthority()))) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
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
                    HttpStatus.NOT_FOUND,
                    "Assigned job not found"
            );
        }

        return technicianId;
    }

    // ==========================================
    // CREATE QUOTATION
    // POST /api/technician/jobs/{bookingId}/quotation
    // ==========================================

    @PostMapping("/{bookingId}/quotation")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceQuotation createQuotation(
            @PathVariable Long bookingId,
            @RequestBody QuotationRequest request,
            Authentication authentication) {

        Long technicianId = verifyTechnician(
                bookingId,
                authentication
        );

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quotation details are required"
            );
        }

        ServiceQuotation quotation = new ServiceQuotation();

        quotation.setBookingId(bookingId);
        quotation.setDiagnosisId(request.diagnosisId());
        quotation.setTechnicianId(technicianId);
        quotation.setPartsCost(request.partsCost());
        quotation.setLabourCost(request.labourCost());
        quotation.setAdditionalCharges(request.additionalCharges());
        quotation.setDescription(request.description());

        return quotationService.create(quotation);
    }

    // ==========================================
    // GET QUOTATION AND CUSTOMER APPROVAL STATUS
    // GET /api/technician/jobs/{bookingId}/quotation
    // ==========================================

    @GetMapping("/{bookingId}/quotation")
    public ServiceQuotation getQuotation(
            @PathVariable Long bookingId,
            Authentication authentication) {

        verifyTechnician(bookingId, authentication);

        return quotationService.getByBookingId(bookingId);
    }
}
