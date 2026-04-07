package com.erp.finance.budget;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    Optional<Budget> findByIdAndIsDeletedFalse(UUID id);

    Optional<Budget> findByDepartmentIdAndYearAndMonthAndIsDeletedFalse(UUID departmentId, Integer year, Integer month);

    @Query("""
        SELECT b FROM Budget b LEFT JOIN FETCH b.department
        WHERE b.isDeleted = false
        AND (:departmentId IS NULL OR b.department.id = :departmentId)
        AND (:year IS NULL OR b.year = :year)
        AND (:month IS NULL OR b.month = :month)
    """)
    Page<Budget> findAllWithFilters(@Param("departmentId") UUID departmentId,
            @Param("year") Integer year, @Param("month") Integer month, Pageable pageable);

    @Query("SELECT COALESCE(SUM(b.allocated), 0) FROM Budget b WHERE b.year = :year AND b.isDeleted = false")
    BigDecimal sumAllocatedByYear(@Param("year") Integer year);

    @Query("SELECT COALESCE(SUM(b.spent), 0) FROM Budget b WHERE b.year = :year AND b.isDeleted = false")
    BigDecimal sumSpentByYear(@Param("year") Integer year);

    List<Budget> findByYearAndIsDeletedFalse(Integer year);
}
