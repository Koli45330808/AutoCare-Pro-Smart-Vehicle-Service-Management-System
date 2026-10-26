
package com.vehicle.service.repository;

import com.vehicle.service.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository
        extends JpaRepository<Review, Long> {

    Optional<Review> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);

    List<Review> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );
}
