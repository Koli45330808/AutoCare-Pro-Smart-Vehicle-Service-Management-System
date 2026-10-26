
package com.vehicle.service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_inspections")
public class VehicleInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long bookingId;

    @Column(nullable = false)
    private Long technicianId;

    private String engineCondition;
    private String brakeCondition;
    private String tyreCondition;
    private String batteryCondition;

    @Column(length = 2000)
    private String technicianNotes;

    private LocalDateTime inspectedAt;

    @PrePersist
    public void onCreate() {
        inspectedAt = LocalDateTime.now();
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

    public String getEngineCondition() { return engineCondition; }
    public void setEngineCondition(String value) {
        this.engineCondition = value;
    }

    public String getBrakeCondition() { return brakeCondition; }
    public void setBrakeCondition(String value) {
        this.brakeCondition = value;
    }

    public String getTyreCondition() { return tyreCondition; }
    public void setTyreCondition(String value) {
        this.tyreCondition = value;
    }

    public String getBatteryCondition() { return batteryCondition; }
    public void setBatteryCondition(String value) {
        this.batteryCondition = value;
    }

    public String getTechnicianNotes() { return technicianNotes; }
    public void setTechnicianNotes(String value) {
        this.technicianNotes = value;
    }

    public LocalDateTime getInspectedAt() { return inspectedAt; }
    public void setInspectedAt(LocalDateTime inspectedAt) {
        this.inspectedAt = inspectedAt;
    }
}
