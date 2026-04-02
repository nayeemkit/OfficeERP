package com.erp.hr.attendance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CheckInRequest {

    @NotNull(message = "Employee is required")
    private UUID employeeId;

    private String remarks;
}
