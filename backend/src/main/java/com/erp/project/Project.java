package com.erp.project;

import com.erp.common.BaseEntity;
import com.erp.hr.employee.Employee;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Table(name = "proj_projects")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Project extends BaseEntity {
    @Column(nullable = false, length = 200) private String name;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "start_date") private LocalDate startDate;
    @Column(name = "end_date") private LocalDate endDate;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) @Builder.Default
    private ProjectEnums.ProjectStatus status = ProjectEnums.ProjectStatus.PLANNING;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) @Builder.Default
    private ProjectEnums.Priority priority = ProjectEnums.Priority.MEDIUM;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "owner_id") private Employee owner;
    @Column(nullable = false) @Builder.Default private Integer progress = 0;
}
