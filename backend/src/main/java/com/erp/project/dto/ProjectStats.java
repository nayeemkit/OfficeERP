package com.erp.project.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProjectStats {
    private long totalProjects; private long planning; private long inProgress;
    private long completed; private long onHold;
}
