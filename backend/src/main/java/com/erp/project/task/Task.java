package com.erp.project.task;

import com.erp.common.BaseEntity;
import com.erp.hr.employee.Employee;
import com.erp.project.Project;
import com.erp.project.ProjectEnums;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "proj_tasks")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Task extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "project_id", nullable = false) private Project project;
    @Column(nullable = false, length = 200) private String title;
    @Column(columnDefinition = "TEXT") private String description;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "assignee_id") private Employee assignee;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) @Builder.Default
    private ProjectEnums.Priority priority = ProjectEnums.Priority.MEDIUM;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) @Builder.Default
    private ProjectEnums.TaskStatus status = ProjectEnums.TaskStatus.TODO;
    @Column(name = "due_date") private LocalDate dueDate;
    @Column(name = "estimated_hours", precision = 6, scale = 1) private BigDecimal estimatedHours;
    @Column(name = "actual_hours", precision = 6, scale = 1) private BigDecimal actualHours;
    @Column(name = "sort_order", nullable = false) @Builder.Default private Integer sortOrder = 0;
}
