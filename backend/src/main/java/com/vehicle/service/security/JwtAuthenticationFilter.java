
package com.vehicle.service.security;

import com.vehicle.service.entity.Customer;
import com.vehicle.service.repository.CustomerRepository;
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

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomerRepository customerRepository) {
        this.jwtService = jwtService;
        this.customerRepository = customerRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtService.isTokenValid(token)
                    && SecurityContextHolder.getContext()
                            .getAuthentication() == null) {

                Long customerId = jwtService.extractCustomerId(token);

                Customer customer = customerRepository
                        .findById(customerId)
                        .orElse(null);

                if (customer != null
                        && "CUSTOMER".equals(customer.getRole())) {

                    var authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_CUSTOMER")
                    );

                    var authentication =
                        new UsernamePasswordAuthenticationToken(
                            customer.getId(),
                            null,
                            authorities
                        );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
