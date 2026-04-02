package com.erp.hr.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySummary {

    private UUID employeeId;
    private String employeeName;
    private String employeeCode;
    private int year;
    private int month;
    private long totalWorkingDays;
    private long presentDays;
    private long absentDays;
    private long lateDays;
    private long halfDays;
    private long leaveDays;
    private BigDecimal totalWorkHours;
    private BigDecimal avgWorkHours;
    private List<AttendanceResponse> dailyRecords;
}
