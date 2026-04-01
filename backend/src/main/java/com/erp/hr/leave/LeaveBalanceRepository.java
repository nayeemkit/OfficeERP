package com.erp.hr.leave;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, UUID> {

    List<LeaveBalance> findAllByEmployeeIdAndYearAndIsDeletedFalse(UUID employeeId, Integer year);

    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeIdAndYearAndIsDeletedFalse(
            UUID employeeId, UUID leaveTypeId, Integer year);

    @Query("""
        SELECT lb FROM LeaveBalance lb
        LEFT JOIN FETCH lb.leaveType
        LEFT JOIN FETCH lb.employee
        WHERE lb.employee.id = :employeeId AND lb.year = :year AND lb.isDeleted = false
    """)
    List<LeaveBalance> findBalancesWithDetails(@Param("employeeId") UUID employeeId, @Param("year") Integer year);
}