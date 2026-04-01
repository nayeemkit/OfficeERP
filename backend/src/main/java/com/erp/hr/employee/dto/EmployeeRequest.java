package com.erp.hr.employee.dto;

import com.erp.hr.employee.EmployeeEnums;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class EmployeeRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 20)
    private String phone;

    @NotNull(message = "Department is required")
    private UUID departmentId;

    private UUID designationId;

    private UUID reportingTo;

    @NotNull(message = "Join date is required")
    private LocalDate joinDate;

    @DecimalMin(value = "0.0", message = "Salary cannot be negative")
    private BigDecimal salary;

    private EmployeeEnums.EmploymentType employmentType;

    private EmployeeEnums.EmployeeStatus status;

    private String address;

    private LocalDate dateOfBirth;

    private EmployeeEnums.Gender gender;
}
