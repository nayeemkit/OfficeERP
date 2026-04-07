package com.erp.project.dto;

import com.erp.project.ProjectEnums;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProjectResponse {
    private UUID id; private String name; private String description;
    private LocalDate startDate; private LocalDate endDate;
    private ProjectEnums.ProjectStatus status; private ProjectEnums.Priority priority;
    private UUID ownerId; private String ownerName;
    private Integer progress; private long taskCount; private long completedTasks;
    private long milestoneCount; private long completedMilestones; private LocalDateTime createdAt;
}
