package com.erp.hr.payroll;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, UUID> {

    Optional<Payslip> findByIdAndIsDeletedFalse(UUID id);

    Optional<Payslip> findByEmployeeIdAndYearAndMonthAndIsDeletedFalse(UUID employeeId, Integer year, Integer month);

    @Query("""
        SELECT p FROM Payslip p
        LEFT JOIN FETCH p.employee e
        LEFT JOIN FETCH e.department
        WHERE p.isDeleted = false
        AND (:employeeId IS NULL OR p.employee.id = :employeeId)
        AND (:year IS NULL OR p.year = :year)
        AND (:month IS NULL OR p.month = :month)
        AND (:status IS NULL OR p.status = :status)
    """)
    Page<Payslip> findAllWithFilters(
            @Param("employeeId") UUID employeeId,
            @Param("year") Integer year,
            @Param("month") Integer month,
            @Param("status") PayslipStatus status,
            Pageable pageable
    );

    long countByYearAndMonthAndIsDeletedFalse(Integer year, Integer month);

    long countByYearAndMonthAndStatusAndIsDeletedFalse(Integer year, Integer month, PayslipStatus status);
}
