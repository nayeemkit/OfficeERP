package com.erp.project.task.dto;

import com.erp.project.ProjectEnums;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskResponse {
    private UUID id; private UUID projectId; private String projectName;
    private String title; private String description;
    private UUID assigneeId; private String assigneeName;
    private ProjectEnums.Priority priority; private ProjectEnums.TaskStatus status;
    private LocalDate dueDate; private BigDecimal estimatedHours; private BigDecimal actualHours;
    private Integer sortOrder; private LocalDateTime createdAt;
}
