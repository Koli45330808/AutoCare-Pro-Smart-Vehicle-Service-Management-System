
package com.vehicle.service.controller;

import com.vehicle.service.entity.ServicePayment;
import com.vehicle.service.service.ServicePaymentService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
public class ServicePaymentController {

    private final ServicePaymentService paymentService;

    public ServicePaymentController(
            ServicePaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // ADMIN: Record verified payment
    @PostMapping("/api/admin/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public ServicePayment recordPayment(
            @RequestBody ServicePayment payment) {

        return paymentService.recordPayment(payment);
    }

    // ADMIN: View all payments
    @GetMapping("/api/admin/payments")
    public List<ServicePayment> getAll() {
        return paymentService.getAll();
    }

    // ADMIN: View payment by invoice
    @GetMapping("/api/admin/payments/invoice/{invoiceId}")
    public ServicePayment getByInvoice(
            @PathVariable Long invoiceId) {

        return paymentService.getByInvoiceId(invoiceId);
    }

    // CUSTOMER: View payment for own booking
    @GetMapping("/api/customer/bookings/{bookingId}/payment")
    public ServicePayment getCustomerPayment(
            @PathVariable Long bookingId,
            Authentication authentication) {

        if (authentication == null
                || !(authentication.getPrincipal() instanceof Long customerId)) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Customer login required");
        }

        return paymentService.getCustomerPayment(
                bookingId, customerId);
    }
}
