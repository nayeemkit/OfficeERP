package com.erp.finance.budget.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BudgetResponse {
    private UUID id; private UUID departmentId; private String departmentName;
    private Integer year; private Integer month;
    private BigDecimal allocated; private BigDecimal spent; private BigDecimal remaining;
    private double utilization; private String notes;
}
