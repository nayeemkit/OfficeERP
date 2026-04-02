package com.erp.hr.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryStructureResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private BigDecimal basicSalary;
    private BigDecimal houseAllowance;
    private BigDecimal transportAllowance;
    private BigDecimal medicalAllowance;
    private BigDecimal otherAllowance;
    private BigDecimal taxDeduction;
    private BigDecimal insuranceDeduction;
    private BigDecimal otherDeduction;
    private BigDecimal totalAllowances;
    private BigDecimal totalDeductions;
    private BigDecimal grossSalary;
    private BigDecimal netSalary;
    private LocalDate effectiveFrom;
    private Boolean isActive;
}
