
package com.vehicle.service.service;

import com.vehicle.service.entity.VehicleInspection;
import com.vehicle.service.entity.ServiceBooking;
import com.vehicle.service.entity.TechnicianAssignment;
import com.vehicle.service.repository.VehicleInspectionRepository;
import com.vehicle.service.repository.ServiceBookingRepository;
import com.vehicle.service.repository.TechnicianAssignmentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@Service
public class VehicleInspectionService {

    private final VehicleInspectionRepository inspectionRepository;
    private final ServiceBookingRepository bookingRepository;
    private final TechnicianAssignmentRepository assignmentRepository;

    private static final Set<String> CONDITIONS =
            Set.of("GOOD", "FAIR", "POOR");

    public VehicleInspectionService(
            VehicleInspectionRepository inspectionRepository,
            ServiceBookingRepository bookingRepository,
            TechnicianAssignmentRepository assignmentRepository
    ) {
        this.inspectionRepository = inspectionRepository;
        this.bookingRepository = bookingRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public VehicleInspection createInspection(VehicleInspection inspection) {

        if (inspection.getBookingId() == null ||
                inspection.getTechnicianId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking ID and technician ID are required"
            );
        }

        ServiceBooking booking = bookingRepository
                .findById(inspection.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Booking not found"
                ));

        if (!"IN_PROGRESS".equals(booking.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Service must be IN_PROGRESS before inspection"
            );
        }

        TechnicianAssignment assignment = assignmentRepository
                .findByBookingId(inspection.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Booking has no technician assignment"
                ));

        if (!assignment.getTechnicianId()
                .equals(inspection.getTechnicianId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Technician does not match assignment"
            );
        }

        if (inspectionRepository.existsByBookingId(
                inspection.getBookingId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Inspection already exists for this booking"
            );
        }

        validateCondition(inspection.getEngineCondition());
        validateCondition(inspection.getBrakeCondition());
        validateCondition(inspection.getTyreCondition());
        validateCondition(inspection.getBatteryCondition());

        inspection.setId(null);
        inspection.setInspectedAt(null);

        return inspectionRepository.save(inspection);
    }

    private void validateCondition(String condition) {
        if (condition == null || !CONDITIONS.contains(condition)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Condition must be GOOD, FAIR, or POOR"
            );
        }
    }

    public VehicleInspection getByBookingId(Long bookingId) {
        return inspectionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Inspection not found"
                ));
    }

    public List<VehicleInspection> getAllInspections() {
        return inspectionRepository.findAll();
    }
}
