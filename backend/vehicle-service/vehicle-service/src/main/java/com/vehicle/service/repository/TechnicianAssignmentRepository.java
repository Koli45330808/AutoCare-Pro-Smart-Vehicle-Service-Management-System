
package com.vehicle.service.repository;

import com.vehicle.service.entity.TechnicianAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TechnicianAssignmentRepository
        extends JpaRepository<TechnicianAssignment, Long> {

    Optional<TechnicianAssignment> findByBookingId(Long bookingId);

    List<TechnicianAssignment> findByTechnicianId(Long technicianId);

    boolean existsByBookingId(Long bookingId);
}
