
package com.vehicle.service.controller;

import com.vehicle.service.entity.Vehicle;
import com.vehicle.service.repository.VehicleRepository;
import com.vehicle.service.service.VehicleService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http://localhost:5173")
public class VehicleController {

    private final VehicleService vehicleService;
    private final VehicleRepository vehicleRepository;

    public VehicleController(
            VehicleService vehicleService,
            VehicleRepository vehicleRepository) {

        this.vehicleService = vehicleService;
        this.vehicleRepository = vehicleRepository;
    }

    // Get authenticated customer ID from JWT
    private Long getCustomerId(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof Long)) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        return (Long) authentication.getPrincipal();
    }

    // Verify that the vehicle belongs to the customer
    private void checkOwnership(Long vehicleId, Long customerId) {

        if (!vehicleRepository.existsByIdAndCustomerId(
                vehicleId, customerId)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Vehicle not found"
            );
        }
    }

    // 1. GET ONLY LOGGED-IN CUSTOMER VEHICLES
    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles(
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        List<Vehicle> vehicles =
                vehicleRepository.findByCustomerId(customerId);

        return ResponseEntity.ok(vehicles);
    }

    // 2. GET VEHICLE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(
            @PathVariable Long id,
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        checkOwnership(id, customerId);

        Vehicle vehicle = vehicleService.getVehicleById(id);

        return ResponseEntity.ok(vehicle);
    }

    // 3. ADD NEW VEHICLE
    @PostMapping
    public ResponseEntity<Vehicle> addVehicle(
            @Valid @RequestBody Vehicle vehicle,
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        // Customer ID must come from JWT, not frontend
        vehicle.setCustomerId(customerId);

        Vehicle savedVehicle =
                vehicleService.addVehicle(vehicle);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedVehicle);
    }

    // 4. UPDATE CUSTOMER'S OWN VEHICLE
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody Vehicle vehicle,
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        checkOwnership(id, customerId);

        // Prevent frontend from changing ownership
        vehicle.setCustomerId(customerId);

        Vehicle updatedVehicle =
                vehicleService.updateVehicle(id, vehicle);

        return ResponseEntity.ok(updatedVehicle);
    }

    // 5. DELETE CUSTOMER'S OWN VEHICLE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVehicle(
            @PathVariable Long id,
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        checkOwnership(id, customerId);

        vehicleService.deleteVehicle(id);

        return ResponseEntity.ok(
                "Vehicle deleted successfully"
        );
    }
}
