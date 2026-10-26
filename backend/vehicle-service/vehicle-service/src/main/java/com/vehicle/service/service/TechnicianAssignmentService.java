
package com.vehicle.service.service;

import com.vehicle.service.entity.ServiceBooking;
import com.vehicle.service.entity.Technician;
import com.vehicle.service.entity.TechnicianAssignment;

import com.vehicle.service.repository.ServiceBookingRepository;
import com.vehicle.service.repository.TechnicianRepository;
import com.vehicle.service.repository.TechnicianAssignmentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TechnicianAssignmentService {

    private final TechnicianAssignmentRepository assignmentRepository;
    private final ServiceBookingRepository bookingRepository;
    private final TechnicianRepository technicianRepository;

    public TechnicianAssignmentService(
            TechnicianAssignmentRepository assignmentRepository,
            ServiceBookingRepository bookingRepository,
            TechnicianRepository technicianRepository
    ) {
        this.assignmentRepository = assignmentRepository;
        this.bookingRepository = bookingRepository;
        this.technicianRepository = technicianRepository;
    }

    // ADMIN ASSIGNS TECHNICIAN
    @Transactional
    public TechnicianAssignment assignTechnician(
            Long bookingId,
            Long technicianId
    ) {

        // Validate IDs
        if (bookingId == null || bookingId <= 0 ||
                technicianId == null || technicianId <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid booking and technician IDs are required"
            );
        }

        // Find booking
        ServiceBooking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Booking not found"
                        )
                );

        // Only confirmed bookings can be assigned
        if (!"CONFIRMED".equalsIgnoreCase(
                booking.getStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only confirmed bookings can be assigned"
            );
        }

        // Prevent duplicate assignments
        if (assignmentRepository.existsByBookingId(
                bookingId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This booking already has an assigned technician"
            );
        }

        // Find technician
        Technician technician = technicianRepository
                .findById(technicianId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Technician not found"
                        )
                );

        // Check technician role
        if (!"TECHNICIAN".equalsIgnoreCase(
                technician.getRole())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Selected user is not a technician"
            );
        }

        // Check approval status
        if (!"APPROVED".equalsIgnoreCase(
                technician.getApprovalStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Technician must be approved before assignment"
            );
        }

        // Create assignment
        TechnicianAssignment assignment =
                new TechnicianAssignment();

        assignment.setBookingId(bookingId);
        assignment.setTechnicianId(technicianId);

        // Save assignment
        return assignmentRepository.save(assignment);
    }

    // ADMIN: GET ALL ASSIGNMENTS
    @Transactional(readOnly = true)
    public List<TechnicianAssignment> getAllAssignments() {

        return assignmentRepository.findAll();
    }

    // TECHNICIAN: GET ASSIGNED JOBS
    @Transactional(readOnly = true)
    public List<TechnicianAssignment> getTechnicianJobs(
            Long technicianId
    ) {

        if (technicianId == null || technicianId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid technician ID is required"
            );
        }

        return assignmentRepository.findByTechnicianId(
                technicianId
        );
    }

    // GET ASSIGNMENT BY BOOKING ID
    @Transactional(readOnly = true)
    public TechnicianAssignment getAssignmentByBookingId(
            Long bookingId
    ) {

        return assignmentRepository
                .findByBookingId(bookingId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Assignment not found"
                        )
                );
    }
}
