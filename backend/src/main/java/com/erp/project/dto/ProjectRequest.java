package com.erp.project.dto;

import com.erp.project.ProjectEnums;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ProjectRequest {
    @NotBlank(message = "Name is required") private String name;
    private String description; private LocalDate startDate; private LocalDate endDate;
    private ProjectEnums.ProjectStatus status; private ProjectEnums.Priority priority; private UUID ownerId;
}
