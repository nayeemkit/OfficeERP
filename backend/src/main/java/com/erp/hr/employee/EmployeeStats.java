package com.erp.hr.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeStats {

    private long totalEmployees;
    private long activeEmployees;
    private long onLeave;
    private long resigned;
}
