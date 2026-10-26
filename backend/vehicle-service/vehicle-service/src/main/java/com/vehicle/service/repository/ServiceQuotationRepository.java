
package com.vehicle.service.repository;

import com.vehicle.service.entity.ServiceQuotation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ServiceQuotationRepository
        extends JpaRepository<ServiceQuotation, Long> {

    Optional<ServiceQuotation> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);
}
