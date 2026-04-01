package com.erp.hr.department;

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
public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    Optional<Department> findByIdAndIsDeletedFalse(UUID id);

    boolean existsByNameAndIsDeletedFalse(String name);

    List<Department> findAllByIsDeletedFalseAndIsActiveTrue();

    @Query("""
        SELECT d FROM Department d
        WHERE d.isDeleted = false
        AND (:search IS NULL OR :search = ''
            OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Department> findAllWithSearch(@Param("search") String search, Pageable pageable);

    long countByIsDeletedFalse();
}
