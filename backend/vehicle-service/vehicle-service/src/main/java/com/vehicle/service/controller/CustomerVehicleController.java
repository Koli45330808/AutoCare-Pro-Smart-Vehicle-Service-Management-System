
package com.vehicle.service.controller;

import com.vehicle.service.entity.Vehicle;
import com.vehicle.service.repository.VehicleRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/customer/vehicles")
public class CustomerVehicleController {

    private final VehicleRepository vehicleRepository;

    public CustomerVehicleController(
            VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    private Long getCustomerId(Authentication authentication) {
        if (authentication == null ||
            !(authentication.getPrincipal() instanceof Long)) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Customer authentication required"
            );
        }

        return (Long) authentication.getPrincipal();
    }

    // 1. Add a vehicle
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Vehicle addVehicle(
            @Valid @RequestBody Vehicle request,
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        if (request.getId() != null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Do not provide vehicle ID"
            );
        }

        if (vehicleRepository.existsByRegistrationNumber(
                request.getRegistrationNumber())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Registration number already exists"
            );
        }

        Vehicle vehicle = new Vehicle();

        vehicle.setCustomerId(customerId);
        vehicle.setOwnerName(request.getOwnerName());
        vehicle.setRegistrationNumber(
            request.getRegistrationNumber()
        );
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setFuelType(request.getFuelType());

        return vehicleRepository.save(vehicle);
    }

    // 2. Get my vehicles
    @GetMapping
    public List<Vehicle> getMyVehicles(
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        return vehicleRepository.findByCustomerId(customerId);
    }

    // 3. Get vehicle by ID
    @GetMapping("/{id}")
    public Vehicle getVehicleById(
            @PathVariable Long id,
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        Vehicle vehicle = vehicleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Vehicle not found"
            ));

        if (!customerId.equals(vehicle.getCustomerId())) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Vehicle not found"
            );
        }

        return vehicle;
    }
}
