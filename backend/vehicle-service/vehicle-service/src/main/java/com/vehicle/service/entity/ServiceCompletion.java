
package com.vehicle.service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_completions")
public class ServiceCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long bookingId;

    @Column(nullable = false)
    private Long technicianId;

    @Column(nullable = false, length = 2000)
    private String workPerformed;

    @Column(length = 2000)
    private String technicianNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime completedAt;

    @PrePersist
    public void onCreate() {
        completedAt = LocalDateTime.now();
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

    public String getWorkPerformed() { return workPerformed; }
    public void setWorkPerformed(String workPerformed) {
        this.workPerformed = workPerformed;
    }

    public String getTechnicianNotes() { return technicianNotes; }
    public void setTechnicianNotes(String technicianNotes) {
        this.technicianNotes = technicianNotes;
    }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
