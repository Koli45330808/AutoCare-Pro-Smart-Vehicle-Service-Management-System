package com.vehicle.service.controller;

import com.vehicle.service.entity.Customer;
import com.vehicle.service.repository.CustomerRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class CustomerProfileController {

    private final CustomerRepository customerRepository;

    public CustomerProfileController(
            CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @GetMapping("/me")
    public Map<String, Object> getCurrentCustomer(
            Authentication authentication) {

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof Long)) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authentication required"
            );
        }

        Long customerId = (Long) authentication.getPrincipal();

        Customer customer = customerRepository
                .findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found"
                ));

        return Map.of(
                "customerId", customer.getId(),
                "name", customer.getName(),
                "email", customer.getEmail(),
                "role", customer.getRole()
        );
    }
}