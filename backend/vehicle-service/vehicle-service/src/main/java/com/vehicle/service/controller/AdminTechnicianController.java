package com.vehicle.service.controller;

import com.vehicle.service.entity.Technician;
import com.vehicle.service.repository.TechnicianRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/technicians")
public class AdminTechnicianController {

    private final TechnicianRepository technicianRepository;

    public AdminTechnicianController(
            TechnicianRepository technicianRepository) {
        this.technicianRepository = technicianRepository;
    }

    public record TechnicianResponse(
            Long id,
            String name,
            String email,
            String phone,
            String specialization,
            String approvalStatus
    ) {
        public static TechnicianResponse from(Technician t) {
            return new TechnicianResponse(
                    t.getId(),
                    t.getName(),
                    t.getEmail(),
                    t.getPhone(),
                    t.getSpecialization(),
                    t.getApprovalStatus()
            );
        }
    }

    @GetMapping
    public List<TechnicianResponse> allTechnicians() {
        return technicianRepository.findAll()
                .stream()
                .map(TechnicianResponse::from)
                .toList();
    }

    @GetMapping("/pending")
    public List<TechnicianResponse> pendingTechnicians() {
        return technicianRepository.findAll()
                .stream()
                .filter(t -> "PENDING".equals(t.getApprovalStatus()))
                .map(TechnicianResponse::from)
                .toList();
    }

    @Transactional
    @PatchMapping("/{id}/approve")
    public Map<String, Object> approve(@PathVariable Long id) {
        Technician technician = findPending(id);
        technician.setApprovalStatus("APPROVED");
        technicianRepository.save(technician);

        return Map.of(
                "technicianId", technician.getId(),
                "message", "Technician approved successfully",
                "approvalStatus", "APPROVED"
        );
    }

    @Transactional
    @PatchMapping("/{id}/reject")
    public Map<String, Object> reject(@PathVariable Long id) {
        Technician technician = findPending(id);
        technician.setApprovalStatus("REJECTED");
        technicianRepository.save(technician);

        return Map.of(
                "technicianId", technician.getId(),
                "message", "Technician rejected successfully",
                "approvalStatus", "REJECTED"
        );
    }

    private Technician findPending(Long id) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Technician not found"
                ));

        if (!"PENDING".equals(technician.getApprovalStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending technicians can be reviewed"
            );
        }

        return technician;
    }
}