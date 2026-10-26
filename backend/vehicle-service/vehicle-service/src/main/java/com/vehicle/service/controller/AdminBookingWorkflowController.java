
package com.vehicle.service.controller;

import com.vehicle.service.entity.ServiceBooking;
import com.vehicle.service.entity.Technician;
import com.vehicle.service.entity.TechnicianAssignment;
import com.vehicle.service.entity.Vehicle;

import com.vehicle.service.repository.ServiceBookingRepository;
import com.vehicle.service.repository.TechnicianRepository;
import com.vehicle.service.repository.VehicleRepository;

import com.vehicle.service.service.TechnicianAssignmentService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminBookingWorkflowController {

    private final ServiceBookingRepository bookingRepository;
    private final TechnicianRepository technicianRepository;
    private final TechnicianAssignmentService assignmentService;
    private final VehicleRepository vehicleRepository;

    public AdminBookingWorkflowController(
            ServiceBookingRepository bookingRepository,
            TechnicianRepository technicianRepository,
            TechnicianAssignmentService assignmentService,
            VehicleRepository vehicleRepository) {

        this.bookingRepository = bookingRepository;
        this.technicianRepository = technicianRepository;
        this.assignmentService = assignmentService;
        this.vehicleRepository = vehicleRepository;
    }

    // ADMIN: View all service bookings
    @GetMapping("/bookings")
    public List<ServiceBooking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // ADMIN: View all vehicles
    @GetMapping("/vehicles")
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    // ADMIN: View all technician assignments
    @GetMapping("/assignments")
    public List<TechnicianAssignment> getAllAssignments() {
        return assignmentService.getAllAssignments();
    }

    // ADMIN: Confirm pending booking
    @Transactional
    @PatchMapping("/bookings/{bookingId}/confirm")
    public ServiceBooking confirmBooking(
            @PathVariable Long bookingId) {

        ServiceBooking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"
                ));

        if (!"PENDING".equals(booking.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending bookings can be confirmed"
            );
        }

        booking.setStatus("CONFIRMED");

        return bookingRepository.save(booking);
    }

    // ADMIN: Assign approved technician
    @Transactional
    @PostMapping("/assignments")
    public TechnicianAssignment assignTechnician(
            @Valid @RequestBody AssignmentRequest request) {

        Technician technician = technicianRepository
                .findById(request.technicianId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Technician not found"
                ));

        if (!"TECHNICIAN".equals(technician.getRole())
                || !"APPROVED".equals(
                        technician.getApprovalStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Technician must be approved"
            );
        }

        return assignmentService.assignTechnician(
                request.bookingId(),
                request.technicianId()
        );
    }

    public record AssignmentRequest(
            @NotNull @Positive Long bookingId,
            @NotNull @Positive Long technicianId
    ) {}
}
