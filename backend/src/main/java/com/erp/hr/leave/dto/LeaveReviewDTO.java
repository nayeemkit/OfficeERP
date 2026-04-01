package com.erp.hr.leave.dto;

import com.erp.hr.leave.LeaveEnums;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeaveReviewDTO {

    @NotNull(message = "Status is required")
    private LeaveEnums.LeaveStatus status;

    private String comment;
}