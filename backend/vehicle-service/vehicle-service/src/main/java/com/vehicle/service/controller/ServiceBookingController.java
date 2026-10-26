
package com.vehicle.service.controller;

import com.vehicle.service.entity.ServiceBooking;
import com.vehicle.service.service.ServiceBookingService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class ServiceBookingController {

    private final ServiceBookingService bookingService;

    public ServiceBookingController(
            ServiceBookingService bookingService
    ) {
        this.bookingService = bookingService;
    }

    // Create booking
    @PostMapping
    public ResponseEntity<ServiceBooking> createBooking(
            @Valid @RequestBody ServiceBooking booking
    ) {
        ServiceBooking savedBooking =
                bookingService.createBooking(booking);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedBooking);
    }

    // Get all bookings
    @GetMapping
    public List<ServiceBooking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    // Get booking by ID
    @GetMapping("/{id}")
    public ServiceBooking getBookingById(
            @PathVariable Long id
    ) {
        return bookingService.getBookingById(id);
    }

    // Get bookings by vehicle ID
    @GetMapping("/vehicle/{vehicleId}")
    public List<ServiceBooking> getBookingsByVehicleId(
            @PathVariable Long vehicleId
    ) {
        return bookingService.getBookingsByVehicleId(vehicleId);
    }

    // Update booking status
    @PatchMapping("/{id}/status")
    public ResponseEntity<ServiceBooking> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        ServiceBooking updatedBooking =
                bookingService.updateBookingStatus(
                        id,
                        request.status()
                );

        return ResponseEntity.ok(updatedBooking);
    }

    public record UpdateStatusRequest(
            @NotBlank(message = "Status is required")
            String status
    ) {}
}
