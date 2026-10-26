
package com.vehicle.service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ServiceHistoryResponse(
        Long bookingId,
        String bookingStatus,
        Long technicianId,
        String problemFound,
        String recommendedRepair,
        String workPerformed,
        String technicianNotes,
        LocalDateTime completedAt,
        Long invoiceId,
        BigDecimal totalAmount,
        String paymentStatus,
        String paymentMethod
) {}
