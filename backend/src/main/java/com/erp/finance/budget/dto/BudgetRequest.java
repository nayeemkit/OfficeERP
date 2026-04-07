package com.erp.finance.budget.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class BudgetRequest {
    @NotNull private UUID departmentId;
    @NotNull private Integer year;
    @NotNull @Min(1) @Max(12) private Integer month;
    @NotNull @DecimalMin("0") private BigDecimal allocated;
    private BigDecimal spent;
    private String notes;
}
