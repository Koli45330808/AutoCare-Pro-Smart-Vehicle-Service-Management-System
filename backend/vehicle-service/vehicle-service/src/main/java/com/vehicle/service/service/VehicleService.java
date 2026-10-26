
package com.vehicle.service.service;

import com.vehicle.service.entity.Vehicle;
import com.vehicle.service.repository.VehicleRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    // Get all vehicles
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    // Get vehicle by ID
    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Vehicle not found with ID: " + id
                        )
                );
    }

    // Add a new vehicle
    public Vehicle addVehicle(Vehicle vehicle) {
        String registrationNumber =
                vehicle.getRegistrationNumber().trim();

        if (vehicleRepository.existsByRegistrationNumber(
                registrationNumber)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Registration number already exists. Please use a different number."
            );
        }

        vehicle.setRegistrationNumber(registrationNumber);

        return vehicleRepository.saveAndFlush(vehicle);
    }

    // Update an existing vehicle
    public Vehicle updateVehicle(Long id, Vehicle updatedVehicle) {
        Vehicle existing = getVehicleById(id);

        String registrationNumber =
                updatedVehicle.getRegistrationNumber().trim();

        if (vehicleRepository.existsByRegistrationNumberAndIdNot(
                registrationNumber, id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Registration number already belongs to another vehicle."
            );
        }

        existing.setOwnerName(updatedVehicle.getOwnerName());
        existing.setRegistrationNumber(registrationNumber);
        existing.setMake(updatedVehicle.getMake());
        existing.setModel(updatedVehicle.getModel());
        existing.setYear(updatedVehicle.getYear());
        existing.setVehicleType(updatedVehicle.getVehicleType());
        existing.setFuelType(updatedVehicle.getFuelType());

        return vehicleRepository.saveAndFlush(existing);
    }

    // Delete a vehicle
    public void deleteVehicle(Long id) {
        Vehicle existing = getVehicleById(id);
        vehicleRepository.delete(existing);
    }
}
