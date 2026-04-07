package com.erp.finance.invoice;

import com.erp.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fin_invoices")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Invoice extends BaseEntity {

    @Column(name = "invoice_number", nullable = false, unique = true, length = 20)
    private String invoiceNumber;

    @Column(name = "client_name", nullable = false, length = 200)
    private String clientName;

    @Column(name = "client_email")
    private String clientEmail;

    @Column(name = "client_address", columnDefinition = "TEXT")
    private String clientAddress;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
