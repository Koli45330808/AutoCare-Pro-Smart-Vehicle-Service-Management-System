
package com.vehicle.service.service;

import com.vehicle.service.entity.VehicleDiagnosis;
import com.vehicle.service.repository.VehicleDiagnosisRepository;
import com.vehicle.service.repository.VehicleInspectionRepository;
import com.vehicle.service.repository.ServiceBookingRepository;
import com.vehicle.service.entity.ServiceBooking;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class VehicleDiagnosisService {

    private final VehicleDiagnosisRepository diagnosisRepository;
    private final VehicleInspectionRepository inspectionRepository;
    private final ServiceBookingRepository bookingRepository;

    public VehicleDiagnosisService(
            VehicleDiagnosisRepository diagnosisRepository,
            VehicleInspectionRepository inspectionRepository,
            ServiceBookingRepository bookingRepository) {
        this.diagnosisRepository = diagnosisRepository;
        this.inspectionRepository = inspectionRepository;
        this.bookingRepository = bookingRepository;
    }

    public VehicleDiagnosis create(VehicleDiagnosis diagnosis) {

        if (diagnosis.getBookingId() == null ||
            diagnosis.getTechnicianId() == null ||
            diagnosis.getProblemFound() == null ||
            diagnosis.getProblemFound().isBlank() ||
            diagnosis.getRecommendedRepair() == null ||
            diagnosis.getRecommendedRepair().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Required fields are missing"
            );
        }

        ServiceBooking booking = bookingRepository
                .findById(diagnosis.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Booking not found"
                ));

        if (!"IN_PROGRESS".equals(booking.getStatus())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Booking must be IN_PROGRESS"
            );
        }

        var inspection = inspectionRepository
                .findByBookingId(diagnosis.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vehicle inspection must be completed first"
                ));

        if (!inspection.getTechnicianId()
                .equals(diagnosis.getTechnicianId())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Technician does not match inspection"
            );
        }

        if (diagnosisRepository.existsByBookingId(
                diagnosis.getBookingId())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Diagnosis already exists for this booking"
            );
        }

        diagnosis.setId(null);
        diagnosis.setDiagnosedAt(null);

        return diagnosisRepository.save(diagnosis);
    }

    public List<VehicleDiagnosis> getAll() {
        return diagnosisRepository.findAll();
    }

    public VehicleDiagnosis getByBookingId(Long bookingId) {
        return diagnosisRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Diagnosis not found"
                ));
    }
}
