
package com.vehicle.service.security;

import com.vehicle.service.entity.Admin;
import com.vehicle.service.entity.Customer;
import com.vehicle.service.entity.Technician;

import com.vehicle.service.repository.AdminRepository;
import com.vehicle.service.repository.CustomerRepository;
import com.vehicle.service.repository.TechnicianRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;
    private final TechnicianRepository technicianRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomerRepository customerRepository,
            AdminRepository adminRepository,
            TechnicianRepository technicianRepository) {

        this.jwtService = jwtService;
        this.customerRepository = customerRepository;
        this.adminRepository = adminRepository;
        this.technicianRepository = technicianRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (SecurityContextHolder.getContext()
                .getAuthentication() != null) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7).trim();

        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Validate JWT signature and expiration.
            if (jwtService.isTokenValid(token)) {

                String subject = jwtService.extractSubject(token);

                if (subject != null) {
                    authenticateUser(subject);
                }
            }

        } catch (IllegalArgumentException ex) {
            SecurityContextHolder.clearContext();

        } catch (org.springframework.security.core.AuthenticationException ex) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    // ========================================
    // AUTHENTICATE USER BASED ON JWT SUBJECT
    // ========================================

    private void authenticateUser(String subject) {

        if (subject.startsWith("ADMIN:")) {
            authenticateAdmin(subject);
            return;
        }

        if (subject.startsWith("TECHNICIAN:")) {
            authenticateTechnician(subject);
            return;
        }

        if (subject.matches("[0-9]+")) {
            authenticateCustomer(subject);
        }
    }

    // ========================================
    // ADMIN AUTHENTICATION
    // ========================================

    private void authenticateAdmin(String subject) {

        Long adminId = Long.parseLong(
                subject.substring("ADMIN:".length())
        );

        Admin admin = adminRepository
                .findById(adminId)
                .orElse(null);

        if (admin == null) {
            return;
        }

        if (!"ADMIN".equals(admin.getRole())) {
            return;
        }

        setAuthentication(
                admin.getId(),
                "ROLE_ADMIN"
        );
    }

    // ========================================
    // TECHNICIAN AUTHENTICATION
    // ========================================

    private void authenticateTechnician(String subject) {

        Long technicianId = Long.parseLong(
                subject.substring("TECHNICIAN:".length())
        );

        Technician technician = technicianRepository
                .findById(technicianId)
                .orElse(null);

        if (technician == null) {
            return;
        }

        if (!"TECHNICIAN".equals(technician.getRole())) {
            return;
        }

        // Only approved technicians can access
        // protected technician APIs.
        if (!"APPROVED".equals(
                technician.getApprovalStatus())) {
            return;
        }

        setAuthentication(
                technician.getId(),
                "ROLE_TECHNICIAN"
        );
    }

    // ========================================
    // CUSTOMER AUTHENTICATION
    // ========================================

    private void authenticateCustomer(String subject) {

        Long customerId = Long.parseLong(subject);

        Customer customer = customerRepository
                .findById(customerId)
                .orElse(null);

        if (customer == null) {
            return;
        }

        if (!"CUSTOMER".equals(customer.getRole())) {
            return;
        }

        setAuthentication(
                customer.getId(),
                "ROLE_CUSTOMER"
        );
    }

    // ========================================
    // SET SPRING SECURITY AUTHENTICATION
    // ========================================

    private void setAuthentication(
            Long userId,
            String role) {

        var authorities = List.of(
                new SimpleGrantedAuthority(role)
        );

        var authentication =
                new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        authorities
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
    }
}
