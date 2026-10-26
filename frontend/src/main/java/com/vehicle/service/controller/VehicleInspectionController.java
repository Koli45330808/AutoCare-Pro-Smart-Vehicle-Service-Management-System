
package com.vehicle.service.controller;

import com.vehicle.service.entity.VehicleInspection;
import com.vehicle.service.service.VehicleInspectionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspections")
@CrossOrigin(origins = "http://localhost:5173")
public class VehicleInspectionController {

    private final VehicleInspectionService inspectionService;

    public VehicleInspectionController(
            VehicleInspectionService inspectionService
    ) {
        this.inspectionService = inspectionService;
    }

    @PostMapping
    public ResponseEntity<VehicleInspection> createInspection(
            @RequestBody VehicleInspection inspection
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inspectionService.createInspection(inspection));
    }

    @GetMapping("/booking/{bookingId}")
    public VehicleInspection getByBookingId(
            @PathVariable Long bookingId
    ) {
        return inspectionService.getByBookingId(bookingId);
    }

    @GetMapping
    public List<VehicleInspection> getAllInspections() {
        return inspectionService.getAllInspections();
    }
}
