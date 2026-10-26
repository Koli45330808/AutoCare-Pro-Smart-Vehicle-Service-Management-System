
package com.vehicle.service.service;

import com.vehicle.service.entity.ServicePayment;
import com.vehicle.service.entity.ServiceInvoice;

import com.vehicle.service.repository.ServicePaymentRepository;
import com.vehicle.service.repository.ServiceInvoiceRepository;
import com.vehicle.service.repository.ServiceBookingRepository;
import com.vehicle.service.repository.VehicleRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class ServicePaymentService {

    private final ServicePaymentRepository paymentRepository;
    private final ServiceInvoiceRepository invoiceRepository;
    private final ServiceBookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;

    public ServicePaymentService(
            ServicePaymentRepository paymentRepository,
            ServiceInvoiceRepository invoiceRepository,
            ServiceBookingRepository bookingRepository,
            VehicleRepository vehicleRepository) {

        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
    }

    // ==========================================
    // ADMIN: RECORD VERIFIED PAYMENT
    // ==========================================

    @Transactional
    public ServicePayment recordPayment(ServicePayment request) {

        // STEP 1: Validate required fields
        if (request == null ||
                request.getInvoiceId() == null ||
                request.getInvoiceId() <= 0 ||
                request.getAmount() == null ||
                request.getPaymentMethod() == null ||
                request.getPaymentMethod().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid invoice ID, amount and payment method are required"
            );
        }

        // STEP 2: Validate payment method
        String method = request.getPaymentMethod()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!Set.of(
                "CASH",
                "UPI",
                "CARD",
                "BANK_TRANSFER"
        ).contains(method)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid payment method"
            );
        }

        // STEP 3: Lock invoice to prevent concurrent payments
        ServiceInvoice invoice = invoiceRepository
                .findByIdForUpdate(request.getInvoiceId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invoice not found"
                ));

        // STEP 4: Invoice must be sent to customer
        if (!"SENT_TO_CUSTOMER".equals(
                invoice.getInvoiceStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invoice must be sent to customer before recording payment"
            );
        }

        // STEP 5: Prevent duplicate payment
        if ("PAID".equals(invoice.getPaymentStatus()) ||
                paymentRepository.existsByInvoiceId(invoice.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invoice already paid"
            );
        }

        // STEP 6: Validate invoice amount
        if (invoice.getTotalAmount() == null ||
                invoice.getTotalAmount().signum() <= 0 ||
                request.getAmount().compareTo(
                        invoice.getTotalAmount()) != 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment amount must match the positive invoice total"
            );
        }

        // STEP 7: Validate transaction reference
        String transactionReference = null;

        if (!"CASH".equals(method)) {

            if (request.getTransactionReference() == null ||
                    request.getTransactionReference().isBlank()) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Transaction reference is required for non-cash payments"
                );
            }

            transactionReference =
                    request.getTransactionReference().trim();

            if (transactionReference.length() > 255) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Transaction reference is too long"
                );
            }
        }

        // STEP 8: Create payment record
        ServicePayment payment = new ServicePayment();

        payment.setInvoiceId(invoice.getId());
        payment.setBookingId(invoice.getBookingId());
        payment.setAmount(invoice.getTotalAmount());
        payment.setPaymentMethod(method);
        payment.setTransactionReference(transactionReference);
        payment.setPaymentStatus("SUCCESS");

        // STEP 9: Save payment record
        ServicePayment savedPayment =
                paymentRepository.save(payment);

        // STEP 10: Mark invoice as paid
        invoice.setPaymentStatus("PAID");
        invoiceRepository.save(invoice);

        // Both changes are committed together by @Transactional
        return savedPayment;
    }

    // ==========================================
    // ADMIN: GET ALL PAYMENTS
    // ==========================================

    @Transactional(readOnly = true)
    public List<ServicePayment> getAll() {

        return paymentRepository.findAll();
    }

    // ==========================================
    // ADMIN: GET PAYMENT BY INVOICE ID
    // ==========================================

    @Transactional(readOnly = true)
    public ServicePayment getByInvoiceId(Long invoiceId) {

        if (invoiceId == null || invoiceId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid invoice ID is required"
            );
        }

        return paymentRepository.findByInvoiceId(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment not found"
                ));
    }

    // ==========================================
    // CUSTOMER: VIEW OWN BOOKING PAYMENT
    // ==========================================

    @Transactional(readOnly = true)
    public ServicePayment getCustomerPayment(
            Long bookingId,
            Long customerId) {

        if (bookingId == null || customerId == null ||
                bookingId <= 0 || customerId <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid booking ID and customer ID are required"
            );
        }

        // STEP 1: Find booking
        var booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment not found"
                ));

        // STEP 2: Check customer ownership
        boolean isOwner =
                vehicleRepository.existsByIdAndCustomerId(
                        booking.getVehicleId(),
                        customerId
                );

        if (!isOwner) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Payment not found"
            );
        }

        // STEP 3: Find booking invoice
        ServiceInvoice invoice = invoiceRepository
                .findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment not found"
                ));

        // STEP 4: Return payment
        return paymentRepository
                .findByInvoiceId(invoice.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment not found"
                ));
    }
}
