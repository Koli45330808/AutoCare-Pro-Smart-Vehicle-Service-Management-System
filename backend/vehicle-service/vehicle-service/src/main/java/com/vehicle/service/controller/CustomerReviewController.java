
package com.vehicle.service.controller;

import com.vehicle.service.dto.ReviewRequest;
import com.vehicle.service.entity.Review;
import com.vehicle.service.entity.ServiceBooking;
import com.vehicle.service.repository.ReviewRepository;
import com.vehicle.service.repository.ServiceBookingRepository;
import com.vehicle.service.repository.ServiceCompletionRepository;
import com.vehicle.service.repository.VehicleRepository;

import jakarta.validation.Valid;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerReviewController {

    private final ReviewRepository reviewRepository;
    private final ServiceBookingRepository bookingRepository;
    private final ServiceCompletionRepository completionRepository;
    private final VehicleRepository vehicleRepository;

    public CustomerReviewController(
            ReviewRepository reviewRepository,
            ServiceBookingRepository bookingRepository,
            ServiceCompletionRepository completionRepository,
            VehicleRepository vehicleRepository) {

        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.completionRepository = completionRepository;
        this.vehicleRepository = vehicleRepository;
    }

    private Long getCustomerId(Authentication authentication) {

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof Long)) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        return (Long) authentication.getPrincipal();
    }

    private ServiceBooking getOwnedBooking(
            Long bookingId,
            Long customerId) {

        ServiceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"
                ));

        if (!vehicleRepository.existsByIdAndCustomerId(
                booking.getVehicleId(), customerId)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Booking not found"
            );
        }

        return booking;
    }

    // SUBMIT REVIEW
    @PostMapping("/bookings/{bookingId}/review")
    @ResponseStatus(HttpStatus.CREATED)
    public Review submitReview(
            @PathVariable Long bookingId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        ServiceBooking booking =
                getOwnedBooking(bookingId, customerId);

        if (!"COMPLETED".equalsIgnoreCase(booking.getStatus())
                || !completionRepository.existsByBookingId(bookingId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Service must be completed before reviewing"
            );
        }

        if (reviewRepository.existsByBookingId(bookingId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Review already submitted for this booking"
            );
        }

        Review review = new Review();
        review.setBookingId(bookingId);
        review.setCustomerId(customerId);
        review.setRating(request.rating());
        review.setComment(request.comment().trim());

        try {
            return reviewRepository.saveAndFlush(review);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Review could not be saved; it may already exist"
            );
        }
    }

    // GET REVIEW FOR A BOOKING
    @GetMapping("/bookings/{bookingId}/review")
    @Transactional(readOnly = true)
    public Review getBookingReview(
            @PathVariable Long bookingId,
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        getOwnedBooking(bookingId, customerId);

        return reviewRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Review not found"
                ));
    }

    // GET ALL REVIEWS OF LOGGED-IN CUSTOMER
    @GetMapping("/reviews")
    @Transactional(readOnly = true)
    public List<Review> getMyReviews(
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        return reviewRepository
                .findByCustomerIdOrderByCreatedAtDesc(customerId);
    }
}
