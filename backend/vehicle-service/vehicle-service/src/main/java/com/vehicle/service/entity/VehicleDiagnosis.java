
package com.vehicle.service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_diagnoses")
public class VehicleDiagnosis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long bookingId;

    @Column(nullable = false)
    private Long technicianId;

    @Column(nullable = false, length = 2000)
    private String problemFound;

    @Column(nullable = false, length = 2000)
    private String recommendedRepair;

    @Column(length = 2000)
    private String additionalNotes;

    private LocalDateTime diagnosedAt;

    @PrePersist
    public void onCreate() {
        diagnosedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getTechnicianId() { return technicianId; }
    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }

    public String getProblemFound() { return problemFound; }
    public void setProblemFound(String problemFound) {
        this.problemFound = problemFound;
    }

    public String getRecommendedRepair() {
        return recommendedRepair;
    }
    public void setRecommendedRepair(String recommendedRepair) {
        this.recommendedRepair = recommendedRepair;
    }

    public String getAdditionalNotes() {
        return additionalNotes;
    }
    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }

    public LocalDateTime getDiagnosedAt() {
        return diagnosedAt;
    }
    public void setDiagnosedAt(LocalDateTime diagnosedAt) {
        this.diagnosedAt = diagnosedAt;
    }
}
