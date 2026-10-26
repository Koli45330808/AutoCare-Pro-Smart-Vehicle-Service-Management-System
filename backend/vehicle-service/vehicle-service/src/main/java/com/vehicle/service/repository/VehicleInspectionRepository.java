
package com.vehicle.service.repository;

import com.vehicle.service.entity.VehicleInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleInspectionRepository
        extends JpaRepository<VehicleInspection, Long> {

    Optional<VehicleInspection> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);
}
