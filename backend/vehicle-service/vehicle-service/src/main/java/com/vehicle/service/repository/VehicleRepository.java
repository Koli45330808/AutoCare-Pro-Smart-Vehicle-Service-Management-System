
package com.vehicle.service.repository;

import com.vehicle.service.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VehicleRepository
        extends JpaRepository<Vehicle, Long> {

    // Check whether registration number already exists
    boolean existsByRegistrationNumber(
            String registrationNumber);

    // Check registration number except current vehicle
    boolean existsByRegistrationNumberAndIdNot(
            String registrationNumber,
            Long id);

    // Find all vehicles belonging to a customer
    List<Vehicle> findByCustomerId(Long customerId);

    // Find a customer's specific vehicle
    boolean existsByIdAndCustomerId(
            Long id,
            Long customerId);
}
