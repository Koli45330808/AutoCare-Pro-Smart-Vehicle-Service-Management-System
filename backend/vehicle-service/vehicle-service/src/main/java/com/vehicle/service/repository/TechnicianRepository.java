
package com.vehicle.service.repository;

import com.vehicle.service.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TechnicianRepository
        extends JpaRepository<Technician, Long> {

    Optional<Technician> findByEmail(String email);

    boolean existsByEmail(String email);
}
