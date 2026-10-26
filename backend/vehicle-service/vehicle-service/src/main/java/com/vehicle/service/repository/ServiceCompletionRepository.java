
package com.vehicle.service.repository;

import com.vehicle.service.entity.ServiceCompletion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ServiceCompletionRepository
        extends JpaRepository<ServiceCompletion, Long> {

    Optional<ServiceCompletion> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);
}
