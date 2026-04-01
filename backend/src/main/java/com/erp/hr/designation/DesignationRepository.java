package com.erp.hr.designation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, UUID> {

    Optional<Designation> findByIdAndIsDeletedFalse(UUID id);

    boolean existsByTitleAndIsDeletedFalse(String title);

    List<Designation> findAllByIsDeletedFalseAndIsActiveTrue();

    List<Designation> findAllByDepartmentIdAndIsDeletedFalseAndIsActiveTrue(UUID departmentId);

    @Query("""
        SELECT d FROM Designation d LEFT JOIN FETCH d.department
        WHERE d.isDeleted = false
        AND (:search IS NULL OR :search = ''
            OR LOWER(d.title) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:departmentId IS NULL OR d.department.id = :departmentId)
    """)
    Page<Designation> findAllWithFilters(
            @Param("search") String search,
            @Param("departmentId") UUID departmentId,
            Pageable pageable
    );
}
