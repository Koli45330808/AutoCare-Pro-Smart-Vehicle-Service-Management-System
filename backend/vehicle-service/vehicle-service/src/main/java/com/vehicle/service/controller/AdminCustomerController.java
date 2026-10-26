
package com.vehicle.service.controller;

import com.vehicle.service.entity.Customer;
import com.vehicle.service.entity.Vehicle;
import com.vehicle.service.entity.ServiceBooking;

import com.vehicle.service.repository.CustomerRepository;
import com.vehicle.service.repository.VehicleRepository;
import com.vehicle.service.repository.ServiceBookingRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminCustomerController {

    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final ServiceBookingRepository bookingRepository;

    public AdminCustomerController(
            CustomerRepository customerRepository,
            VehicleRepository vehicleRepository,
            ServiceBookingRepository bookingRepository) {

        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.bookingRepository = bookingRepository;
    }

    // =========================================
    // ADMIN - GET ALL CUSTOMERS
    // =========================================

    @GetMapping("/customers")
    public List<CustomerResponse> getAllCustomers() {

        List<Customer> customers = customerRepository.findAll();
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<ServiceBooking> bookings = bookingRepository.findAll();

        // Count vehicles belonging to each customer.
        Map<Long, Long> vehicleCounts = vehicles.stream()
                .filter(vehicle -> vehicle.getCustomerId() != null)
                .collect(Collectors.groupingBy(
                        Vehicle::getCustomerId,
                        Collectors.counting()
                ));

        // Map vehicle IDs to customer IDs.
        Map<Long, Long> vehicleCustomerMap = new HashMap<>();

        for (Vehicle vehicle : vehicles) {
            if (vehicle.getId() != null
                    && vehicle.getCustomerId() != null) {

                vehicleCustomerMap.put(
                        vehicle.getId(),
                        vehicle.getCustomerId()
                );
            }
        }

        // Count bookings belonging to each customer.
        Map<Long, Long> bookingCounts = new HashMap<>();

        for (ServiceBooking booking : bookings) {

            Long customerId = vehicleCustomerMap.get(
                    booking.getVehicleId()
            );

            if (customerId != null) {
                bookingCounts.merge(customerId, 1L, Long::sum);
            }
        }

        // Return safe customer information.
        return customers.stream()
                .map(customer -> new CustomerResponse(
                        customer.getId(),
                        customer.getName(),
                        customer.getEmail(),
                        customer.getPhone(),
                        "UNKNOWN",
                        vehicleCounts.getOrDefault(
                                customer.getId(), 0L
                        ),
                        bookingCounts.getOrDefault(
                                customer.getId(), 0L
                        )
                ))
                .toList();
    }

    // =========================================
    // CUSTOMER RESPONSE DTO
    // =========================================

    public record CustomerResponse(
            Long id,
            String name,
            String email,
            String phone,
            String status,
            Long vehicles,
            Long bookings
    ) {}
}
