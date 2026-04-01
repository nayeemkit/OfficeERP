package com.erp.hr.leave;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    Optional<LeaveRequest> findByIdAndIsDeletedFalse(UUID id);

    @Query("""
        SELECT lr FROM LeaveRequest lr
        LEFT JOIN FETCH lr.employee e
        LEFT JOIN FETCH lr.leaveType
        LEFT JOIN FETCH e.department
        WHERE lr.isDeleted = false
        AND (:employeeId IS NULL OR lr.employee.id = :employeeId)
        AND (:status IS NULL OR lr.status = :status)
        AND (:departmentId IS NULL OR e.department.id = :departmentId)
    """)
    Page<LeaveRequest> findAllWithFilters(
            @Param("employeeId") UUID employeeId,
            @Param("status") LeaveEnums.LeaveStatus status,
            @Param("departmentId") UUID departmentId,
            Pageable pageable
    );

    long countByStatusAndIsDeletedFalse(LeaveEnums.LeaveStatus status);

    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.employee.department.id = :departmentId AND lr.status = :status AND lr.isDeleted = false")
    long countByDepartmentAndStatus(@Param("departmentId") UUID departmentId, @Param("status") LeaveEnums.LeaveStatus status);
}