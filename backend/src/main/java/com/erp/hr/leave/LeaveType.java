package com.erp.hr.leave;

import com.erp.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hr_leave_types")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveType extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "default_days", nullable = false)
    @Builder.Default
    private Integer defaultDays = 0;

    @Column(name = "is_paid", nullable = false)
    @Builder.Default
    private Boolean isPaid = true;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
