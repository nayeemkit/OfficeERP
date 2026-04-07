package com.erp.project.milestone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class MilestoneRequest {
    @NotNull private UUID projectId;
    @NotBlank private String name;
    private String description;
    @NotNull private LocalDate targetDate;
}
