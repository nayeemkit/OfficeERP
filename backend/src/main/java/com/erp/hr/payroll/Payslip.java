package com.erp.hr.payroll;

import com.erp.common.BaseEntity;
import com.erp.hr.employee.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "hr_payslips", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "year", "month"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payslip extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer month;

    @Column(name = "basic_salary", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal basicSalary = BigDecimal.ZERO;

    @Column(name = "total_allowances", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAllowances = BigDecimal.ZERO;

    @Column(name = "total_deductions", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "gross_salary", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal grossSalary = BigDecimal.ZERO;

    @Column(name = "net_salary", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal netSalary = BigDecimal.ZERO;

    @Column(name = "working_days", nullable = false)
    @Builder.Default
    private Integer workingDays = 0;

    @Column(name = "present_days", nullable = false)
    @Builder.Default
    private Integer presentDays = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PayslipStatus status = PayslipStatus.DRAFT;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(length = 500)
    private String remarks;
}
