package com.erp.hr.designation;

import com.erp.common.BaseEntity;
import com.erp.hr.department.Department;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hr_designations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Designation extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String title;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
