
package com.vehicle.service.repository;

import com.vehicle.service.entity.ServiceInvoice;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ServiceInvoiceRepository
        extends JpaRepository<ServiceInvoice, Long> {

    Optional<ServiceInvoice> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);

    // Lock invoice while recording payment
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM ServiceInvoice i WHERE i.id = :invoiceId")
    Optional<ServiceInvoice> findByIdForUpdate(
            @Param("invoiceId") Long invoiceId
    );
}
