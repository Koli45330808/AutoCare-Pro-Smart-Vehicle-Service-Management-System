
package com.vehicle.service.controller;

import com.vehicle.service.dto.ServiceHistoryResponse;
import com.vehicle.service.entity.ServiceBooking;
import com.vehicle.service.repository.ServiceBookingRepository;
import com.vehicle.service.repository.VehicleRepository;
import com.vehicle.service.service.ServiceHistoryService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/customer/service-history")
public class ServiceHistoryController {

    private final ServiceHistoryService historyService;
    private final ServiceBookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;

    public ServiceHistoryController(
            ServiceHistoryService historyService,
            ServiceBookingRepository bookingRepository,
            VehicleRepository vehicleRepository) {

        this.historyService = historyService;
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
    }

    // CUSTOMER: Get history for a specific booking
    @GetMapping("/booking/{bookingId}")
    public ServiceHistoryResponse getByBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        ServiceBooking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"
                ));

        boolean isOwner = vehicleRepository.existsByIdAndCustomerId(
                booking.getVehicleId(),
                customerId
        );

        if (!isOwner) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Booking not found"
            );
        }

        return historyService.getByBookingId(bookingId);
    }

    // CUSTOMER: Get all completed service history
    @GetMapping
    public List<ServiceHistoryResponse> getCustomerHistory(
            Authentication authentication) {

        Long customerId = getCustomerId(authentication);

        return historyService.getCustomerHistory(customerId);
    }

    // Extract authenticated customer ID
    private Long getCustomerId(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof Long customerId)) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Customer login required"
            );
        }

        return customerId;
    }
}
