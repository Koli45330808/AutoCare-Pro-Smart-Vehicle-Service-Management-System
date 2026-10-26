
package com.vehicle.service.repository;

import com.vehicle.service.entity.ServiceBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceBookingRepository
        extends JpaRepository<ServiceBooking, Long> {

    List<ServiceBooking> findByVehicleId(Long vehicleId);

    boolean existsByVehicleId(Long vehicleId);

    List<ServiceBooking> findByVehicleIdIn(
            List<Long> vehicleIds
    );
}
