
package com.vehicle.service.service;

import com.vehicle.service.dto.ServiceHistoryResponse;

import com.vehicle.service.entity.ServiceBooking;
import com.vehicle.service.entity.ServiceCompletion;
import com.vehicle.service.entity.ServiceInvoice;
import com.vehicle.service.entity.ServicePayment;
import com.vehicle.service.entity.Vehicle;
import com.vehicle.service.entity.VehicleDiagnosis;

import com.vehicle.service.repository.ServiceBookingRepository;
import com.vehicle.service.repository.ServiceCompletionRepository;
import com.vehicle.service.repository.ServiceInvoiceRepository;
import com.vehicle.service.repository.ServicePaymentRepository;
import com.vehicle.service.repository.VehicleDiagnosisRepository;
import com.vehicle.service.repository.VehicleRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ServiceHistoryService {

    private final ServiceBookingRepository bookingRepository;
    private final ServiceCompletionRepository completionRepository;
    private final ServiceInvoiceRepository invoiceRepository;
    private final ServicePaymentRepository paymentRepository;
    private final VehicleDiagnosisRepository diagnosisRepository;
    private final VehicleRepository vehicleRepository;

    public ServiceHistoryService(
            ServiceBookingRepository bookingRepository,
            ServiceCompletionRepository completionRepository,
            ServiceInvoiceRepository invoiceRepository,
            ServicePaymentRepository paymentRepository,
            VehicleDiagnosisRepository diagnosisRepository,
            VehicleRepository vehicleRepository) {

        this.bookingRepository = bookingRepository;
        this.completionRepository = completionRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.vehicleRepository = vehicleRepository;
    }

    // Get completed service history for one booking
    @Transactional(readOnly = true)
    public ServiceHistoryResponse getByBookingId(Long bookingId) {

        ServiceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"
                ));

        ServiceCompletion completion = completionRepository
                .findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Service not completed"
                ));

        ServiceInvoice invoice = invoiceRepository
                .findByBookingId(bookingId)
                .orElse(null);

        VehicleDiagnosis diagnosis = diagnosisRepository
                .findByBookingId(bookingId)
                .orElse(null);

        ServicePayment payment = invoice == null
                ? null
                : paymentRepository
                        .findByInvoiceId(invoice.getId())
                        .orElse(null);

        return new ServiceHistoryResponse(
                booking.getId(),
                booking.getStatus(),
                completion.getTechnicianId(),

                diagnosis == null
                        ? null
                        : diagnosis.getProblemFound(),

                diagnosis == null
                        ? null
                        : diagnosis.getRecommendedRepair(),

                completion.getWorkPerformed(),
                completion.getTechnicianNotes(),
                completion.getCompletedAt(),

                invoice == null
                        ? null
                        : invoice.getId(),

                invoice == null
                        ? null
                        : invoice.getTotalAmount(),

                invoice == null
                        ? null
                        : invoice.getPaymentStatus(),

                payment == null
                        ? null
                        : payment.getPaymentMethod()
        );
    }

    // Get all completed services for logged-in customer
    @Transactional(readOnly = true)
    public List<ServiceHistoryResponse> getCustomerHistory(
            Long customerId) {

        List<Long> vehicleIds = vehicleRepository
                .findByCustomerId(customerId)
                .stream()
                .map(Vehicle::getId)
                .toList();

        if (vehicleIds.isEmpty()) {
            return List.of();
        }

        return bookingRepository.findByVehicleIdIn(vehicleIds)
                .stream()
                .filter(booking ->
                        "COMPLETED".equals(booking.getStatus()))
                .map(booking -> getByBookingId(booking.getId()))
                .toList();
    }
}
