package com.erp.hr.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStats {

    private LocalDate date;
    private long totalCheckedIn;
    private long present;
    private long absent;
    private long late;
    private long halfDay;
    private long onLeave;
}
