package com.vehicle.service.config;

import com.vehicle.service.entity.Admin;
import com.vehicle.service.repository.AdminRepository;
import com.vehicle.service.repository.CustomerRepository;
import com.vehicle.service.repository.TechnicianRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner initializeAdmin(
            AdminRepository adminRepository,
            CustomerRepository customerRepository,
            TechnicianRepository technicianRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            String email = System.getenv("ADMIN_EMAIL");
            String password = System.getenv("ADMIN_PASSWORD");
            String name = System.getenv("ADMIN_NAME");

            if (email == null || email.isBlank()
                    || password == null || password.isBlank()) {
                System.out.println(
                    "Admin initialization skipped: credentials not configured."
                );
                return;
            }

            email = email.trim().toLowerCase(Locale.ROOT);

            if (password.length() < 12) {
                throw new IllegalStateException(
                    "ADMIN_PASSWORD must contain at least 12 characters."
                );
            }

            if (adminRepository.existsByEmail(email)) {
                System.out.println(
                    "Admin account already exists. No new admin created."
                );
                return;
            }

            if (customerRepository.existsByEmail(email)
                    || technicianRepository.existsByEmail(email)) {
                throw new IllegalStateException(
                    "Admin email is already used by another account."
                );
            }

            Admin admin = new Admin();

            admin.setName(
                name == null || name.isBlank()
                    ? "System Administrator"
                    : name.trim()
            );

            admin.setEmail(email);
            admin.setPasswordHash(passwordEncoder.encode(password));

            adminRepository.save(admin);

            System.out.println(
                "Initial admin account created successfully."
            );
        };
    }
}
