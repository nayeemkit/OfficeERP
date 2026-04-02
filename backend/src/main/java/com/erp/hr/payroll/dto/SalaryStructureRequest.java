package com.erp.hr.payroll.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class SalaryStructureRequest {

    @NotNull(message = "Employee is required")
    private UUID employeeId;

    @NotNull @DecimalMin("0")
    private BigDecimal basicSalary;

    @DecimalMin("0")
    private BigDecimal houseAllowance;

    @DecimalMin("0")
    private BigDecimal transportAllowance;

    @DecimalMin("0")
    private BigDecimal medicalAllowance;

    @DecimalMin("0")
    private BigDecimal otherAllowance;

    @DecimalMin("0")
    private BigDecimal taxDeduction;

    @DecimalMin("0")
    private BigDecimal insuranceDeduction;

    @DecimalMin("0")
    private BigDecimal otherDeduction;

    @NotNull(message = "Effective date is required")
    private LocalDate effectiveFrom;
}
