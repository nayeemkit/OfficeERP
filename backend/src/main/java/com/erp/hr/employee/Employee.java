package com.erp.hr.employee;

import com.erp.common.BaseEntity;
import com.erp.hr.department.Department;
import com.erp.hr.designation.Designation;
import com.erp.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "hr_employees")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee extends BaseEntity {

    @Column(name = "employee_code", nullable = false, unique = true, length = 20)
    private String employeeCode;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 20)
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "designation_id")
    private Designation designation;

    @Column(name = "reporting_to")
    private UUID reportingTo;

    @Column(name = "join_date", nullable = false)
    private LocalDate joinDate;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal salary = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 20)
    @Builder.Default
    private EmployeeEnums.EmploymentType employmentType = EmployeeEnums.EmploymentType.FULL_TIME;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EmployeeEnums.EmployeeStatus status = EmployeeEnums.EmployeeStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private EmployeeEnums.Gender gender;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
