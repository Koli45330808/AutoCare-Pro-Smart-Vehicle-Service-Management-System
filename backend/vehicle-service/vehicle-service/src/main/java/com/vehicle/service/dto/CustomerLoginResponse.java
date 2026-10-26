
package com.vehicle.service.dto;

public record CustomerLoginResponse(
    Long customerId,
    String name,
    String email,
    String role,
    String message
) {}
