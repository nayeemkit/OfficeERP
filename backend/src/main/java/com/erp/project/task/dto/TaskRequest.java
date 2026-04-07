package com.erp.project.task.dto;

import com.erp.project.ProjectEnums;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class TaskRequest {
    @NotNull private UUID projectId;
    @NotBlank(message = "Title is required") private String title;
    private String description; private UUID assigneeId;
    private ProjectEnums.Priority priority; private ProjectEnums.TaskStatus status;
    private LocalDate dueDate; private BigDecimal estimatedHours; private BigDecimal actualHours;
}
