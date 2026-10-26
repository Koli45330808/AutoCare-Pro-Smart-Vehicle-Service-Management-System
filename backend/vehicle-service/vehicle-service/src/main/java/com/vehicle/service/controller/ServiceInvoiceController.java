
package com.vehicle.service.controller;

import com.vehicle.service.entity.ServiceInvoice;
import com.vehicle.service.entity.TechnicianAssignment;

import com.vehicle.service.repository.TechnicianAssignmentRepository;
import com.vehicle.service.service.ServiceInvoiceService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
public class ServiceInvoiceController {

    private final ServiceInvoiceService invoiceService;
    private final TechnicianAssignmentRepository assignmentRepository;

    // ==========================================
    // CONSTRUCTOR INJECTION
    // ==========================================

    public ServiceInvoiceController(
            ServiceInvoiceService invoiceService,
            TechnicianAssignmentRepository assignmentRepository) {

        this.invoiceService = invoiceService;
        this.assignmentRepository = assignmentRepository;
    }

    // ==========================================
    // CHECK AUTHENTICATED USER ROLE
    // ==========================================

    private Long requireRole(
            Authentication authentication,
            String role) {

        if (authentication == null
                || !(authentication.getPrincipal() instanceof Long)
                || authentication.getAuthorities().stream()
                    .noneMatch(authority ->
                        role.equals(authority.getAuthority()))) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Required role: " + role
            );
        }

        return (Long) authentication.getPrincipal();
    }

    // ==========================================
    // TECHNICIAN: SUBMIT INVOICE TO ADMIN
    //
    // POST /api/technician/bookings/{bookingId}/invoice/submit
    // ==========================================

    @PostMapping(
        "/api/technician/bookings/{bookingId}/invoice/submit"
    )
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceInvoice submitInvoice(
            @PathVariable Long bookingId,
            Authentication authentication) {

        Long technicianId = requireRole(
                authentication,
                "ROLE_TECHNICIAN"
        );

        return invoiceService.submitByTechnician(
                bookingId,
                technicianId
        );
    }

    // ==========================================
    // TECHNICIAN: VIEW ASSIGNED INVOICE
    //
    // GET /api/technician/bookings/{bookingId}/invoice
    // ==========================================

    @GetMapping(
        "/api/technician/bookings/{bookingId}/invoice"
    )
    public ServiceInvoice technicianInvoice(
            @PathVariable Long bookingId,
            Authentication authentication) {

        Long technicianId = requireRole(
                authentication,
                "ROLE_TECHNICIAN"
        );

        TechnicianAssignment assignment =
                assignmentRepository
                    .findByBookingId(bookingId)
                    .orElseThrow(() ->
                        new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Assigned booking not found"
                        )
                    );

        if (!technicianId.equals(
                assignment.getTechnicianId())) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Assigned booking not found"
            );
        }

        return invoiceService.getByBookingId(bookingId);
    }

    // ==========================================
    // ADMIN: GENERATE INVOICE (EXISTING FEATURE)
    //
    // POST /api/admin/invoices/generate/{bookingId}
    // ==========================================

    @PostMapping(
        "/api/admin/invoices/generate/{bookingId}"
    )
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceInvoice generateInvoice(
            @PathVariable Long bookingId,
            Authentication authentication) {

        requireRole(authentication, "ROLE_ADMIN");

        return invoiceService.generateInvoice(bookingId);
    }

    // ==========================================
    // ADMIN: VIEW ALL INVOICES
    //
    // GET /api/admin/invoices
    // ==========================================

    @GetMapping("/api/admin/invoices")
    public List<ServiceInvoice> getAll(
            Authentication authentication) {

        requireRole(authentication, "ROLE_ADMIN");

        return invoiceService.getAll();
    }

    // ==========================================
    // ADMIN: VIEW INVOICE BY BOOKING ID
    //
    // GET /api/admin/invoices/booking/{bookingId}
    // ==========================================

    @GetMapping(
        "/api/admin/invoices/booking/{bookingId}"
    )
    public ServiceInvoice getByBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {

        requireRole(authentication, "ROLE_ADMIN");

        return invoiceService.getByBookingId(bookingId);
    }

    // ==========================================
    // ADMIN: SEND INVOICE TO CUSTOMER
    //
    // PATCH /api/admin/invoices/{invoiceId}/send-to-customer
    // ==========================================

    @PatchMapping(
        "/api/admin/invoices/{invoiceId}/send-to-customer"
    )
    public ServiceInvoice sendInvoiceToCustomer(
            @PathVariable Long invoiceId,
            Authentication authentication) {

        requireRole(authentication, "ROLE_ADMIN");

        return invoiceService.sendInvoiceToCustomer(
                invoiceId
        );
    }

    // ==========================================
    // CUSTOMER: VIEW RELEASED INVOICE
    //
    // GET /api/customer/bookings/{bookingId}/invoice
    // ==========================================

    @GetMapping(
        "/api/customer/bookings/{bookingId}/invoice"
    )
    public ServiceInvoice customerInvoice(
            @PathVariable Long bookingId,
            Authentication authentication) {

        Long customerId = requireRole(
                authentication,
                "ROLE_CUSTOMER"
        );

        return invoiceService.getCustomerInvoice(
                bookingId,
                customerId
        );
    }
}
