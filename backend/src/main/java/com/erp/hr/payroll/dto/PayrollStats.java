package com.erp.hr.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollStats {

    private long totalPayslips;
    private long draftCount;
    private long confirmedCount;
    private long paidCount;
}
