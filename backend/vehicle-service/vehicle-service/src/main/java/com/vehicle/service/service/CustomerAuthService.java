package com.vehicle.service.service;

import com.vehicle.service.dto.CustomerRegisterRequest;
import com.vehicle.service.entity.Customer;
import com.vehicle.service.repository.CustomerRepository;
import com.vehicle.service.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public CustomerAuthService(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // CUSTOMER REGISTRATION
    public Long register(CustomerRegisterRequest request) {

        String email = request.email().trim().toLowerCase();

        if (customerRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already registered"
            );
        }

        Customer customer = new Customer();

        customer.setName(request.name());
        customer.setEmail(email);
        customer.setPhone(request.phone());
        customer.setPasswordHash(
                passwordEncoder.encode(request.password())
        );
        customer.setRole("CUSTOMER");

        Customer savedCustomer = customerRepository.save(customer);

        return savedCustomer.getId();
    }

    // CUSTOMER LOGIN
    public Map<String, Object> login(String email, String password) {

        if (email == null || password == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email and password are required"
            );
        }

        Customer customer = customerRepository
                .findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        if (!passwordEncoder.matches(
                password,
                customer.getPasswordHash())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        String token = jwtService.generateToken(customer.getId());

        return Map.of(
                "token", token,
                "customerId", customer.getId(),
                "name", customer.getName(),
                "email", customer.getEmail(),
                "role", customer.getRole()
        );
    }
}