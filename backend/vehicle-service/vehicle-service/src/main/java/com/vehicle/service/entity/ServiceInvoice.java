
package com.vehicle.service.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_invoices")
public class ServiceInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long bookingId;

    @Column(nullable = false)
    private Long quotationId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal partsCost;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal labourCost;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal additionalCharges;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private String invoiceStatus = "SUBMITTED_TO_ADMIN";

    @Column(nullable = false)
    private String paymentStatus = "UNPAID";

    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    private LocalDateTime sentToCustomerAt;

    @PrePersist
    public void onCreate() {
        if (generatedAt == null) {
            generatedAt = LocalDateTime.now();
        }

        if (invoiceStatus == null) {
            invoiceStatus = "SUBMITTED_TO_ADMIN";
        }

        if (paymentStatus == null) {
            paymentStatus = "UNPAID";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getQuotationId() {
        return quotationId;
    }

    public void setQuotationId(Long quotationId) {
        this.quotationId = quotationId;
    }

    public BigDecimal getPartsCost() {
        return partsCost;
    }

    public void setPartsCost(BigDecimal partsCost) {
        this.partsCost = partsCost;
    }

    public BigDecimal getLabourCost() {
        return labourCost;
    }

    public void setLabourCost(BigDecimal labourCost) {
        this.labourCost = labourCost;
    }

    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(
            BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getInvoiceStatus() {
        return invoiceStatus;
    }

    public void setInvoiceStatus(String invoiceStatus) {
        this.invoiceStatus = invoiceStatus;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public LocalDateTime getSentToCustomerAt() {
        return sentToCustomerAt;
    }

    public void setSentToCustomerAt(
            LocalDateTime sentToCustomerAt) {
        this.sentToCustomerAt = sentToCustomerAt;
    }
}
