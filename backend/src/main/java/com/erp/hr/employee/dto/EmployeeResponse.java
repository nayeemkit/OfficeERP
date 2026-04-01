package com.erp.hr.employee.dto;

import com.erp.hr.employee.EmployeeEnums;
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
public class EmployeeResponse {

    private UUID id;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private UUID departmentId;
    private String departmentName;
    private UUID designationId;
    private String designationTitle;
    private UUID reportingTo;
    private LocalDate joinDate;
    private BigDecimal salary;
    private EmployeeEnums.EmploymentType employmentType;
    private EmployeeEnums.EmployeeStatus status;
    private String address;
    private LocalDate dateOfBirth;
    private EmployeeEnums.Gender gender;
    private LocalDateTime createdAt;
}
