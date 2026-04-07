package com.erp.finance.invoice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceRequest {
    @NotBlank(message = "Client name is required") private String clientName;
    private String clientEmail;
    private String clientAddress;
    @NotNull @DecimalMin("0.01") private BigDecimal amount;
    private BigDecimal taxAmount;
    @NotNull(message = "Issue date is required") private LocalDate issueDate;
    @NotNull(message = "Due date is required") private LocalDate dueDate;
    private String notes;
}
