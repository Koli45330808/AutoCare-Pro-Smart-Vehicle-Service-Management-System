
package com.vehicle.service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "service_bookings")
public class ServiceBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Vehicle ID is required")
    @Column(nullable = false)
    private Long vehicleId;

    @NotBlank(message = "Service type is required")
    @Column(nullable = false)
    private String serviceType;

    @NotNull(message = "Service date is required")
    @Column(nullable = false)
    private LocalDate serviceDate;

    @NotBlank(message = "Service time is required")
    @Column(nullable = false)
    private String serviceTime;

    @NotBlank(message = "Problem description is required")
    @Column(nullable = false, length = 2000)
    private String problemDescription;

    @NotBlank(message = "Pickup/drop selection is required")
    @Pattern(regexp = "YES|NO", message = "Pickup/drop must be YES or NO")
    @Column(nullable = false)
    private String pickupDrop = "NO";

    @Column(nullable = false)
    private String status = "PENDING";

    public ServiceBooking() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public LocalDate getServiceDate() {
        return serviceDate;
    }

    public void setServiceDate(LocalDate serviceDate) {
        this.serviceDate = serviceDate;
    }

    public String getServiceTime() {
        return serviceTime;
    }

    public void setServiceTime(String serviceTime) {
        this.serviceTime = serviceTime;
    }

    public String getProblemDescription() {
        return problemDescription;
    }

    public void setProblemDescription(String problemDescription) {
        this.problemDescription = problemDescription;
    }

    public String getPickupDrop() {
        return pickupDrop;
    }

    public void setPickupDrop(String pickupDrop) {
        this.pickupDrop = pickupDrop;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

