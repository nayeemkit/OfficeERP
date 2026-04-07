package com.erp.finance.invoice.dto;

import com.erp.finance.invoice.InvoiceStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InvoiceResponse {
    private UUID id; private String invoiceNumber; private String clientName;
    private String clientEmail; private String clientAddress;
    private BigDecimal amount; private BigDecimal taxAmount; private BigDecimal totalAmount;
    private LocalDate issueDate; private LocalDate dueDate; private LocalDate paidDate;
    private InvoiceStatus status; private String notes; private LocalDateTime createdAt;
}
