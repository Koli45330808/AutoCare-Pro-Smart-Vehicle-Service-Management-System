
package com.vehicle.service.controller;

import com.vehicle.service.entity.ServiceQuotation;
import com.vehicle.service.service.ServiceQuotationService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotations")
public class ServiceQuotationController {

    private final ServiceQuotationService quotationService;

    public ServiceQuotationController(
            ServiceQuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceQuotation create(
            @RequestBody ServiceQuotation quotation) {
        return quotationService.create(quotation);
    }

    @GetMapping
    public List<ServiceQuotation> getAll() {
        return quotationService.getAll();
    }

@PatchMapping("/booking/{bookingId}/status")
public ServiceQuotation updateStatus(
        @PathVariable Long bookingId,
        @RequestParam String action) {

    return quotationService.updateStatus(bookingId, action);
}

    
}
