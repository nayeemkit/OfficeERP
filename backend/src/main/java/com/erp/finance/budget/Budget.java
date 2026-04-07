package com.erp.finance.budget;

import com.erp.common.BaseEntity;
import com.erp.hr.department.Department;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity @Table(name = "fin_budgets", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"department_id", "year", "month"})
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Budget extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false) private Integer year;
    @Column(nullable = false) private Integer month;

    @Column(nullable = false, precision = 12, scale = 2) @Builder.Default
    private BigDecimal allocated = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2) @Builder.Default
    private BigDecimal spent = BigDecimal.ZERO;

    @Column(length = 500) private String notes;

    public BigDecimal getRemaining() { return allocated.subtract(spent); }
    public double getUtilization() {
        return allocated.compareTo(BigDecimal.ZERO) > 0
                ? spent.divide(allocated, 4, java.math.RoundingMode.HALF_UP).doubleValue() * 100 : 0;
    }
}
