
package com.vehicle.service.controller;

import com.vehicle.service.entity.ServiceBooking;
import com.vehicle.service.entity.Vehicle;
import com.vehicle.service.repository.ServiceBookingRepository;
import com.vehicle.service.repository.VehicleRepository;
import com.vehicle.service.service.ServiceBookingService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/customer/bookings")
public class CustomerBookingController {

    private final ServiceBookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final ServiceBookingService bookingService;

    public CustomerBookingController(
            ServiceBookingRepository bookingRepository,
            VehicleRepository vehicleRepository,
            ServiceBookingService bookingService) {

        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.bookingService = bookingService;
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

    // CREATE CUSTOMER BOOKING
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceBooking createBooking(
            @Valid @RequestBody ServiceBooking request,
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        if (request.getVehicleId() == null ||
                !vehicleRepository.existsByIdAndCustomerId(
                        request.getVehicleId(), customerId)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Vehicle not found"
            );
        }

        return bookingService.createBooking(request);
    }

    // GET LOGGED-IN CUSTOMER BOOKINGS
    @GetMapping
    public List<ServiceBooking> getMyBookings(
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        List<Long> vehicleIds = vehicleRepository
                .findByCustomerId(customerId)
                .stream()
                .map(Vehicle::getId)
                .toList();

        if (vehicleIds.isEmpty()) {
            return List.of();
        }

        return bookingRepository.findByVehicleIdIn(vehicleIds);
    }

    // GET CUSTOMER BOOKING BY ID
    @GetMapping("/{id}")
    public ServiceBooking getBookingById(
            @PathVariable Long id,
            Authentication authentication) {

        return getOwnedBooking(
                id,
                getCustomerId(authentication)
        );
    }

    // CANCEL CUSTOMER BOOKING
    @PatchMapping("/{id}/cancel")
    public ServiceBooking cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        ServiceBooking booking = getOwnedBooking(id, customerId);

        String status = booking.getStatus();

        if (!"PENDING".equalsIgnoreCase(status) &&
                !"CONFIRMED".equalsIgnoreCase(status)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This booking cannot be cancelled"
            );
        }

        booking.setStatus("CANCELLED");

        return bookingRepository.save(booking);
    }
}
