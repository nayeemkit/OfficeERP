package com.erp.hr.payroll.dto;

import com.erp.hr.payroll.PayslipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayslipResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String employeeCode;
    private String departmentName;
    private Integer year;
    private Integer month;
    private BigDecimal basicSalary;
    private BigDecimal totalAllowances;
    private BigDecimal totalDeductions;
    private BigDecimal grossSalary;
    private BigDecimal netSalary;
    private Integer workingDays;
    private Integer presentDays;
    private PayslipStatus status;
    private LocalDateTime paidAt;
    private String remarks;
    private LocalDateTime createdAt;
}
