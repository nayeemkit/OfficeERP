package com.erp.hr.attendance.dto;

import com.erp.hr.attendance.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ManualAttendanceRequest {

    @NotNull(message = "Employee is required")
    private UUID employeeId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private LocalDateTime checkIn;

    private LocalDateTime checkOut;

    @NotNull(message = "Status is required")
    private AttendanceStatus status;

    private String remarks;
}
