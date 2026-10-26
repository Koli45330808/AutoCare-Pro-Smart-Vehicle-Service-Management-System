
package com.vehicle.service.service;

import com.vehicle.service.entity.ServiceInvoice;
import com.vehicle.service.entity.ServiceBooking;
import com.vehicle.service.entity.ServiceQuotation;
import com.vehicle.service.entity.TechnicianAssignment;

import com.vehicle.service.repository.ServiceInvoiceRepository;
import com.vehicle.service.repository.ServiceBookingRepository;
import com.vehicle.service.repository.ServiceQuotationRepository;
import com.vehicle.service.repository.ServiceCompletionRepository;
import com.vehicle.service.repository.VehicleRepository;
import com.vehicle.service.repository.TechnicianAssignmentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceInvoiceService {

    private final ServiceInvoiceRepository invoiceRepository;
    private final ServiceBookingRepository bookingRepository;
    private final ServiceQuotationRepository quotationRepository;
    private final ServiceCompletionRepository completionRepository;
    private final VehicleRepository vehicleRepository;
    private final TechnicianAssignmentRepository assignmentRepository;

    public ServiceInvoiceService(
            ServiceInvoiceRepository invoiceRepository,
            ServiceBookingRepository bookingRepository,
            ServiceQuotationRepository quotationRepository,
            ServiceCompletionRepository completionRepository,
            VehicleRepository vehicleRepository,
            TechnicianAssignmentRepository assignmentRepository) {

        this.invoiceRepository = invoiceRepository;
        this.bookingRepository = bookingRepository;
        this.quotationRepository = quotationRepository;
        this.completionRepository = completionRepository;
        this.vehicleRepository = vehicleRepository;
        this.assignmentRepository = assignmentRepository;
    }

    // ==========================================
    // TECHNICIAN: SUBMIT INVOICE TO ADMIN
    // ==========================================

    @Transactional
    public ServiceInvoice submitByTechnician(
            Long bookingId,
            Long technicianId) {

        TechnicianAssignment assignment = assignmentRepository
                .findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Assigned booking not found"));

        if (!technicianId.equals(assignment.getTechnicianId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Assigned booking not found");
        }

        return createDraftInvoice(bookingId);
    }

    // ==========================================
    // ADMIN: GENERATE INVOICE (LEGACY)
    // ==========================================

    @Transactional
    public ServiceInvoice generateInvoice(Long bookingId) {
        return createDraftInvoice(bookingId);
    }

    // ==========================================
    // CREATE INVOICE
    // ==========================================

    private ServiceInvoice createDraftInvoice(Long bookingId) {

        ServiceBooking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"));

        if (!"COMPLETED".equals(booking.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Service must be completed first");
        }

        if (!completionRepository.existsByBookingId(bookingId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Service completion record not found");
        }

        if (invoiceRepository.existsByBookingId(bookingId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invoice already exists for this booking");
        }

        ServiceQuotation quotation = quotationRepository
                .findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Quotation not found"));

        if (!"APPROVED".equals(quotation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Customer must approve quotation first");
        }

        ServiceInvoice invoice = new ServiceInvoice();

        invoice.setBookingId(bookingId);
        invoice.setQuotationId(quotation.getId());

        invoice.setPartsCost(quotation.getPartsCost());
        invoice.setLabourCost(quotation.getLabourCost());
        invoice.setAdditionalCharges(
                quotation.getAdditionalCharges());
        invoice.setTotalAmount(quotation.getTotalAmount());

        invoice.setInvoiceStatus("SUBMITTED_TO_ADMIN");
        invoice.setPaymentStatus("UNPAID");

        return invoiceRepository.save(invoice);
    }

    // ==========================================
    // ADMIN: SEND INVOICE TO CUSTOMER
    // ==========================================

    @Transactional
    public ServiceInvoice sendInvoiceToCustomer(
            Long invoiceId) {

        ServiceInvoice invoice = invoiceRepository
                .findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invoice not found"));

        if ("SENT_TO_CUSTOMER".equals(
                invoice.getInvoiceStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invoice already sent to customer");
        }

        if (!"SUBMITTED_TO_ADMIN".equals(
                invoice.getInvoiceStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invoice is not awaiting Admin review");
        }

        if (!"UNPAID".equals(invoice.getPaymentStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot release an invoice with this payment status");
        }

        invoice.setInvoiceStatus("SENT_TO_CUSTOMER");
        invoice.setSentToCustomerAt(LocalDateTime.now());

        return invoiceRepository.save(invoice);
    }

    // ==========================================
    // ADMIN: VIEW ALL INVOICES
    // ==========================================

    @Transactional(readOnly = true)
    public List<ServiceInvoice> getAll() {
        return invoiceRepository.findAll();
    }

    // ==========================================
    // GET INVOICE BY BOOKING
    // ==========================================

    @Transactional(readOnly = true)
    public ServiceInvoice getByBookingId(Long bookingId) {

        return invoiceRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invoice not found"));
    }

    // ==========================================
    // CUSTOMER: VIEW RELEASED INVOICE ONLY
    // ==========================================

    @Transactional(readOnly = true)
    public ServiceInvoice getCustomerInvoice(
            Long bookingId,
            Long customerId) {

        ServiceBooking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invoice not found"));

        boolean isOwner = vehicleRepository
                .existsByIdAndCustomerId(
                        booking.getVehicleId(),
                        customerId);

        if (!isOwner) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Invoice not found");
        }

        ServiceInvoice invoice = getByBookingId(bookingId);

        if (!"SENT_TO_CUSTOMER".equals(
                invoice.getInvoiceStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Invoice not available yet");
        }

        return invoice;
    }
}
