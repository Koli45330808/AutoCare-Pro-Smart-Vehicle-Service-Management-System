package com.vehicle.service.service;

import com.vehicle.service.entity.*;
import com.vehicle.service.repository.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ServiceCompletionService {

    private final ServiceCompletionRepository completionRepository;
    private final ServiceBookingRepository bookingRepository;
    private final ServiceQuotationRepository quotationRepository;
    private final TechnicianAssignmentRepository assignmentRepository;

    public ServiceCompletionService(
            ServiceCompletionRepository completionRepository,
            ServiceBookingRepository bookingRepository,
            ServiceQuotationRepository quotationRepository,
            TechnicianAssignmentRepository assignmentRepository) {

        this.completionRepository = completionRepository;
        this.bookingRepository = bookingRepository;
        this.quotationRepository = quotationRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional
    public ServiceCompletion completeService(
            Long bookingId,
            Long technicianId,
            String workPerformed,
            String technicianNotes) {

        if (bookingId == null || technicianId == null ||
                workPerformed == null || workPerformed.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking, technician and work details are required");
        }

        TechnicianAssignment assignment = assignmentRepository
                .findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Technician assignment not found"));

        if (!technicianId.equals(assignment.getTechnicianId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not assigned to this booking");
        }

        ServiceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Booking not found"));

        if (completionRepository.existsByBookingId(bookingId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Service already completed");
        }

        if (!"IN_PROGRESS".equals(booking.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Booking must be IN_PROGRESS");
        }

        ServiceQuotation quotation = quotationRepository
                .findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Quotation not found"));

        if (!"APPROVED".equals(quotation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Customer must approve quotation first");
        }

        if (!technicianId.equals(quotation.getTechnicianId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Technician does not match quotation");
        }

        ServiceCompletion completion = new ServiceCompletion();
        completion.setBookingId(bookingId);
        completion.setTechnicianId(technicianId);
        completion.setWorkPerformed(workPerformed.trim());
        completion.setTechnicianNotes(technicianNotes);

        ServiceCompletion saved = completionRepository.save(completion);

        booking.setStatus("COMPLETED");
        bookingRepository.save(booking);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<ServiceCompletion> getAll() {
        return completionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public ServiceCompletion getByBookingId(Long bookingId) {
        return completionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Completion record not found"));
    }
}