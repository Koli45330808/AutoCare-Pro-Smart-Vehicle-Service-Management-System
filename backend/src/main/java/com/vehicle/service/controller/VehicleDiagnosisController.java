
package com.vehicle.service.controller;

import com.vehicle.service.entity.VehicleDiagnosis;
import com.vehicle.service.service.VehicleDiagnosisService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagnoses")
public class VehicleDiagnosisController {

    private final VehicleDiagnosisService diagnosisService;

    public VehicleDiagnosisController(
            VehicleDiagnosisService diagnosisService) {
        this.diagnosisService = diagnosisService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VehicleDiagnosis create(
            @RequestBody VehicleDiagnosis diagnosis) {
        return diagnosisService.create(diagnosis);
    }

    @GetMapping
    public List<VehicleDiagnosis> getAll() {
        return diagnosisService.getAll();
    }

    @GetMapping("/booking/{bookingId}")
    public VehicleDiagnosis getByBooking(
            @PathVariable Long bookingId) {
        return diagnosisService.getByBookingId(bookingId);
    }
}
