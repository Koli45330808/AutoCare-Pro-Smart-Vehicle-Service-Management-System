package com.vehicle.service.repository;

import com.vehicle.service.entity.ServicePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ServicePaymentRepository
        extends JpaRepository<ServicePayment, Long> {

    Optional<ServicePayment> findByInvoiceId(Long invoiceId);

    boolean existsByInvoiceId(Long invoiceId);
}