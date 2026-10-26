
package com.vehicle.service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Customer ownership
    @Column(name = "customer_id")
    private Long customerId;

    @NotBlank(message = "Owner name is required")
    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @NotBlank(message = "Registration number is required")
    @Column(
        name = "registration_number",
        nullable = false,
        unique = true
    )
    private String registrationNumber;

    @NotBlank(message = "Vehicle make is required")
    @Column(nullable = false)
    private String make;

    @NotBlank(message = "Vehicle model is required")
    @Column(nullable = false)
    private String model;

    @Min(value = 1950, message = "Year must be 1950 or later")
    @Max(value = 2100, message = "Year must not exceed 2100")
    @Column(nullable = false)
    private int year;

    private String vehicleType;

    private String fuelType;

    public Vehicle() {
    }

    // ID
    public Long getId() {
        return id;
    }

    // Customer ID
    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    // Owner Name
    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    // Registration Number
    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber =
            registrationNumber == null
                ? null
                : registrationNumber.trim();
    }

    // Make
    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    // Model
    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    // Year
    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    // Vehicle Type
    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    // Fuel Type
    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }
}
