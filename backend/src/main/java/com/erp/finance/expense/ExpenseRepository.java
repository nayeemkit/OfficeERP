package com.erp.finance.expense;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    Optional<Expense> findByIdAndIsDeletedFalse(UUID id);

    @Query("""
        SELECT e FROM Expense e
        LEFT JOIN FETCH e.employee emp LEFT JOIN FETCH emp.department
        LEFT JOIN FETCH e.category
        WHERE e.isDeleted = false
        AND (:employeeId IS NULL OR e.employee.id = :employeeId)
        AND (:categoryId IS NULL OR e.category.id = :categoryId)
        AND (:status IS NULL OR e.status = :status)
        AND (CAST(:dateFrom AS date) IS NULL OR e.expenseDate >= :dateFrom)
        AND (CAST(:dateTo AS date) IS NULL OR e.expenseDate <= :dateTo)
    """)
    Page<Expense> findAllWithFilters(
            @Param("employeeId") UUID employeeId,
            @Param("categoryId") UUID categoryId,
            @Param("status") ExpenseStatus status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            Pageable pageable
    );

    long countByStatusAndIsDeletedFalse(ExpenseStatus status);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.status = 'APPROVED' AND e.isDeleted = false")
    BigDecimal sumApprovedAmount();

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.status = 'PENDING' AND e.isDeleted = false")
    BigDecimal sumPendingAmount();

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(e.expenseNumber, 5) AS int)), 0) FROM Expense e WHERE e.expenseNumber LIKE 'EXP-%'")
    int findMaxExpenseNumber();
}
