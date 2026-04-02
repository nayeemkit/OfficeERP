package com.erp.hr.payroll;

import com.erp.common.BaseEntity;
import com.erp.hr.employee.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "hr_salary_structures")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryStructure extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "basic_salary", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal basicSalary = BigDecimal.ZERO;

    @Column(name = "house_allowance", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal houseAllowance = BigDecimal.ZERO;

    @Column(name = "transport_allowance", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal transportAllowance = BigDecimal.ZERO;

    @Column(name = "medical_allowance", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal medicalAllowance = BigDecimal.ZERO;

    @Column(name = "other_allowance", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal otherAllowance = BigDecimal.ZERO;

    @Column(name = "tax_deduction", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxDeduction = BigDecimal.ZERO;

    @Column(name = "insurance_deduction", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal insuranceDeduction = BigDecimal.ZERO;

    @Column(name = "other_deduction", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal otherDeduction = BigDecimal.ZERO;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public BigDecimal getTotalAllowances() {
        return houseAllowance.add(transportAllowance).add(medicalAllowance).add(otherAllowance);
    }

    public BigDecimal getTotalDeductions() {
        return taxDeduction.add(insuranceDeduction).add(otherDeduction);
    }

    public BigDecimal getGrossSalary() {
        return basicSalary.add(getTotalAllowances());
    }

    public BigDecimal getNetSalary() {
        return getGrossSalary().subtract(getTotalDeductions());
    }
}
