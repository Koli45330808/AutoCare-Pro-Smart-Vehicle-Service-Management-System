
package com.vehicle.service.service;

import com.vehicle.service.entity.ServiceBooking;
import com.vehicle.service.repository.ServiceBookingRepository;
import com.vehicle.service.repository.VehicleRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class ServiceBookingService {

    private final ServiceBookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;

    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING",
            "CONFIRMED",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED"
    );

    public ServiceBookingService(
            ServiceBookingRepository bookingRepository,
            VehicleRepository vehicleRepository) {

        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
    }

    // CREATE BOOKING
    @Transactional
    public ServiceBooking createBooking(ServiceBooking booking) {

        if (booking.getVehicleId() == null ||
                !vehicleRepository.existsById(booking.getVehicleId())) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Vehicle not found"
            );
        }

        if (booking.getServiceDate() == null ||
                booking.getServiceDate().isBefore(LocalDate.now())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Service date cannot be in the past"
            );
        }

        // Do not trust ID or status from the frontend.
        booking.setId(null);
        booking.setStatus("PENDING");

        return bookingRepository.save(booking);
    }

    // GET ALL BOOKINGS
    @Transactional(readOnly = true)
    public List<ServiceBooking> getAllBookings() {

        return bookingRepository.findAll();
    }

    // GET BOOKING BY ID
    @Transactional(readOnly = true)
    public ServiceBooking getBookingById(Long id) {

        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"
                ));
    }

    // GET BOOKINGS BY VEHICLE
    @Transactional(readOnly = true)
    public List<ServiceBooking> getBookingsByVehicleId(
            Long vehicleId) {

        return bookingRepository.findByVehicleId(vehicleId);
    }

    // UPDATE BOOKING STATUS
    @Transactional
    public ServiceBooking updateBookingStatus(
            Long id,
            String status) {

        ServiceBooking booking = getBookingById(id);

        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking status is required"
            );
        }

        String normalizedStatus =
                status.trim().toUpperCase(Locale.ROOT);

        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid booking status"
            );
        }

        booking.setStatus(normalizedStatus);

        return bookingRepository.save(booking);
    }
}
