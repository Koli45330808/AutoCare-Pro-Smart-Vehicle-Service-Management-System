package com.vehicle.service.controller;

import com.vehicle.service.entity.ServiceBooking;
import com.vehicle.service.entity.ServiceQuotation;
import com.vehicle.service.repository.ServiceBookingRepository;
import com.vehicle.service.repository.VehicleRepository;
import com.vehicle.service.service.ServiceQuotationService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/customer/bookings")
public class CustomerQuotationController {

    private final ServiceBookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final ServiceQuotationService quotationService;

    public CustomerQuotationController(
            ServiceBookingRepository bookingRepository,
            VehicleRepository vehicleRepository,
            ServiceQuotationService quotationService) {

        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.quotationService = quotationService;
    }

    private void verifyOwnership(
            Long bookingId,
            Authentication authentication) {

        if (authentication == null
                || !(authentication.getPrincipal() instanceof Long)
                || authentication.getAuthorities().stream()
                    .noneMatch(a -> "ROLE_CUSTOMER"
                            .equals(a.getAuthority()))) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Customer authentication required"
            );
        }

        Long customerId = (Long) authentication.getPrincipal();

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
    }

    public record QuotationActionRequest(String action) {}

    @GetMapping("/{bookingId}/quotation")
    public ServiceQuotation getQuotation(
            @PathVariable Long bookingId,
            Authentication authentication) {

        verifyOwnership(bookingId, authentication);
        return quotationService.getByBookingId(bookingId);
    }

    @Transactional
    @PatchMapping("/{bookingId}/quotation")
    public ServiceQuotation reviewQuotation(
            @PathVariable Long bookingId,
            @RequestBody QuotationActionRequest request,
            Authentication authentication) {

        verifyOwnership(bookingId, authentication);

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Request body is required"
            );
        }

        return quotationService.updateStatus(
                bookingId,
                request.action()
        );
    }
}