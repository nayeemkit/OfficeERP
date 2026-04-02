package com.erp.hr.attendance;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    Optional<Attendance> findByEmployeeIdAndDateAndIsDeletedFalse(UUID employeeId, LocalDate date);

    Optional<Attendance> findByIdAndIsDeletedFalse(UUID id);

//    @Query("""
//        SELECT a FROM Attendance a
//        LEFT JOIN FETCH a.employee e
//        LEFT JOIN FETCH e.department
//        WHERE a.isDeleted = false
//        AND (:employeeId IS NULL OR a.employee.id = :employeeId)
//        AND (:departmentId IS NULL OR e.department.id = :departmentId)
//        AND (:status IS NULL OR a.status = :status)
//        AND (:dateFrom IS NULL OR a.date >= :dateFrom)
//        AND (:dateTo IS NULL OR a.date <= :dateTo)
//    """)
//    Page<Attendance> findAllWithFilters(
//            @Param("employeeId") UUID employeeId,
//            @Param("departmentId") UUID departmentId,
//            @Param("status") AttendanceStatus status,
//            @Param("dateFrom") LocalDate dateFrom,
//            @Param("dateTo") LocalDate dateTo,
//            Pageable pageable
//    );

    @Query("""
    SELECT a FROM Attendance a
    LEFT JOIN FETCH a.employee e
    LEFT JOIN FETCH e.department
    WHERE a.isDeleted = false
    AND (:employeeId IS NULL OR a.employee.id = :employeeId)
    AND (:departmentId IS NULL OR e.department.id = :departmentId)
    AND (:status IS NULL OR a.status = :status)
    AND (CAST(:dateFrom AS date) IS NULL OR a.date >= :dateFrom)
    AND (CAST(:dateTo AS date) IS NULL OR a.date <= :dateTo)
""")
    Page<Attendance> findAllWithFilters(
            @Param("employeeId") UUID employeeId,
            @Param("departmentId") UUID departmentId,
            @Param("status") AttendanceStatus status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            Pageable pageable
    );

    @Query("""
        SELECT a FROM Attendance a
        LEFT JOIN FETCH a.employee e
        WHERE a.isDeleted = false
        AND a.employee.id = :employeeId
        AND a.date BETWEEN :startDate AND :endDate
        ORDER BY a.date ASC
    """)
    List<Attendance> findByEmployeeAndDateRange(
            @Param("employeeId") UUID employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.isDeleted = false AND a.date = :date AND a.status = :status")
    long countByDateAndStatus(@Param("date") LocalDate date, @Param("status") AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.isDeleted = false AND a.date = :date AND a.checkIn IS NOT NULL")
    long countCheckedInByDate(@Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(a) FROM Attendance a
        WHERE a.isDeleted = false
        AND a.employee.id = :employeeId
        AND a.date BETWEEN :startDate AND :endDate
        AND a.status = :status
    """)
    long countByEmployeeAndMonthAndStatus(
            @Param("employeeId") UUID employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") AttendanceStatus status
    );
}
