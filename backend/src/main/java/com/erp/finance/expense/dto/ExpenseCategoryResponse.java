package com.erp.finance.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseCategoryResponse {

    private UUID id;
    private String name;
    private String description;
    private BigDecimal budgetLimit;
    private Boolean isActive;
}
