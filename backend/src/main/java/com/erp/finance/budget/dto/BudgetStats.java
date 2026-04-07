package com.erp.finance.budget.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BudgetStats {
    private BigDecimal totalAllocated; private BigDecimal totalSpent;
    private BigDecimal totalRemaining; private double overallUtilization;
}
