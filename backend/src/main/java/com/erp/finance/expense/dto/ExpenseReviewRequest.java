package com.erp.finance.expense.dto;

import com.erp.finance.expense.ExpenseStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExpenseReviewRequest {

    @NotNull(message = "Status is required")
    private ExpenseStatus status;

    private String comment;
}
