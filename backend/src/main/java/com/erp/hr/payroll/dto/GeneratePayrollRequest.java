package com.erp.hr.payroll.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class GeneratePayrollRequest {

    @NotNull(message = "Year is required")
    private Integer year;

    @NotNull(message = "Month is required")
    @Min(1) @Max(12)
    private Integer month;

    private UUID employeeId;
}
