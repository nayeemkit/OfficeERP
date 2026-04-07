package com.erp.finance.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseStats {

    private long totalExpenses;
    private long pendingCount;
    private long approvedCount;
    private long rejectedCount;
    private BigDecimal totalApprovedAmount;
    private BigDecimal totalPendingAmount;
}
