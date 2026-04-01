package com.erp.hr.leave.dto;

import com.erp.hr.leave.LeaveEnums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String employeeCode;
    private String departmentName;
    private UUID leaveTypeId;
    private String leaveTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalDays;
    private String reason;
    private LeaveEnums.LeaveStatus status;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String reviewComment;
    private LocalDateTime createdAt;
}