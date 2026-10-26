
package com.vehicle.service.service;

import com.vehicle.service.entity.ServiceQuotation;
import com.vehicle.service.entity.VehicleDiagnosis;
import com.vehicle.service.entity.ServiceBooking;

import com.vehicle.service.repository.ServiceQuotationRepository;
import com.vehicle.service.repository.VehicleDiagnosisRepository;
import com.vehicle.service.repository.ServiceBookingRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ServiceQuotationService {

    private final ServiceQuotationRepository quotationRepository;
    private final VehicleDiagnosisRepository diagnosisRepository;
    private final ServiceBookingRepository bookingRepository;

    public ServiceQuotationService(
            ServiceQuotationRepository quotationRepository,
            VehicleDiagnosisRepository diagnosisRepository,
            ServiceBookingRepository bookingRepository) {

        this.quotationRepository = quotationRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.bookingRepository = bookingRepository;
    }

    // CREATE QUOTATION
    public ServiceQuotation create(ServiceQuotation quotation) {

        if (quotation.getBookingId() == null ||
            quotation.getDiagnosisId() == null ||
            quotation.getTechnicianId() == null) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Booking, diagnosis and technician are required"
            );
        }

        ServiceBooking booking = bookingRepository
            .findById(quotation.getBookingId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Booking not found"
            ));

        if (!"IN_PROGRESS".equals(
                String.valueOf(booking.getStatus()))) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Booking must be IN_PROGRESS"
            );
        }

        VehicleDiagnosis diagnosis = diagnosisRepository
            .findById(quotation.getDiagnosisId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Diagnosis not found"
            ));

        if (!diagnosis.getBookingId()
                .equals(quotation.getBookingId())) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Diagnosis does not belong to this booking"
            );
        }

        if (!diagnosis.getTechnicianId()
                .equals(quotation.getTechnicianId())) {

            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Technician does not match diagnosis"
            );
        }

        if (quotationRepository.existsByBookingId(
                quotation.getBookingId())) {

            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Quotation already exists for this booking"
            );
        }

        validateCost(quotation.getPartsCost(), "Parts cost");
        validateCost(quotation.getLabourCost(), "Labour cost");
        validateCost(
            quotation.getAdditionalCharges(),
            "Additional charges"
        );

        BigDecimal total = quotation.getPartsCost()
            .add(quotation.getLabourCost())
            .add(quotation.getAdditionalCharges());

        quotation.setId(null);
        quotation.setTotalAmount(total);
        quotation.setStatus("PENDING");
        quotation.setCreatedAt(null);

        return quotationRepository.save(quotation);
    }

    // VALIDATE COST
    private void validateCost(BigDecimal cost, String field) {

        if (cost == null ||
            cost.compareTo(BigDecimal.ZERO) < 0) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                field + " must be zero or greater"
            );
        }
    }

    // GET ALL QUOTATIONS
    public List<ServiceQuotation> getAll() {
        return quotationRepository.findAll();
    }

    // GET QUOTATION BY BOOKING ID
    public ServiceQuotation getByBookingId(Long bookingId) {

        return quotationRepository.findByBookingId(bookingId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Quotation not found"
            ));
    }

    // APPROVE OR REJECT QUOTATION
    public ServiceQuotation updateStatus(
            Long bookingId, String action) {

        ServiceQuotation quotation = quotationRepository
            .findByBookingId(bookingId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Quotation not found"
            ));

        if (!"PENDING".equals(quotation.getStatus())) {

            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Quotation has already been reviewed"
            );
        }

        if (action == null) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Action is required"
            );
        }

        String newStatus = action.trim().toUpperCase();

        if (!newStatus.equals("APPROVED") &&
            !newStatus.equals("REJECTED")) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Action must be APPROVED or REJECTED"
            );
        }

        quotation.setStatus(newStatus);

        return quotationRepository.save(quotation);
    }

}
