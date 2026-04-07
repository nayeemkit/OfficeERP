package com.erp.project.milestone.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MilestoneResponse {
    private UUID id; private UUID projectId; private String name; private String description;
    private LocalDate targetDate; private LocalDate completedDate; private Boolean isCompleted;
}
