
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

    @GetMapping("/booking/{bookingId}")
    public ServiceHistoryResponse getByBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof Long)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        Long customerId = (Long) authentication.getPrincipal();

        ServiceBooking booking = bookingRepository
                .findById(bookingId)
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

        return historyService.getByBookingId(bookingId);
    }
}
