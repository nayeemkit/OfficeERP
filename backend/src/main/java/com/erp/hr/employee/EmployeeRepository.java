package com.erp.hr.employee;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByIdAndIsDeletedFalse(UUID id);

    boolean existsByEmailAndIsDeletedFalse(String email);

    boolean existsByEmployeeCodeAndIsDeletedFalse(String employeeCode);

    @Query("""
        SELECT e FROM Employee e
        LEFT JOIN FETCH e.department
        LEFT JOIN FETCH e.designation
        WHERE e.isDeleted = false
        AND (:search IS NULL OR :search = ''
            OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:departmentId IS NULL OR e.department.id = :departmentId)
        AND (:status IS NULL OR e.status = :status)
    """)
    Page<Employee> findAllWithFilters(
            @Param("search") String search,
            @Param("departmentId") UUID departmentId,
            @Param("status") EmployeeEnums.EmployeeStatus status,
            Pageable pageable
    );

    long countByIsDeletedFalse();

    long countByStatusAndIsDeletedFalse(EmployeeEnums.EmployeeStatus status);

    long countByDepartmentIdAndIsDeletedFalse(UUID departmentId);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(e.employeeCode, 5) AS int)), 0) FROM Employee e WHERE e.employeeCode LIKE 'EMP-%'")
    int findMaxEmployeeCodeNumber();
}
