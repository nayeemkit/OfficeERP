package com.erp.hr.leave.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class LeaveRequestDTO {

    @NotNull(message = "Employee is required")
    private UUID employeeId;

    @NotNull(message = "Leave type is required")
    private UUID leaveTypeId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private String reason;
}