package com.erp.hr.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class DepartmentRequest {

    @NotBlank(message = "Department name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    private UUID managerId;

    private Boolean isActive;
}
