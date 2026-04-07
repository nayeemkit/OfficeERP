package com.erp.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Optional<Project> findByIdAndIsDeletedFalse(UUID id);

    @Query("""
        SELECT p FROM Project p LEFT JOIN FETCH p.owner WHERE p.isDeleted = false
        AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:status IS NULL OR p.status = :status)
        AND (:priority IS NULL OR p.priority = :priority)
    """)
    Page<Project> findAllWithFilters(@Param("search") String search,
            @Param("status") ProjectEnums.ProjectStatus status,
            @Param("priority") ProjectEnums.Priority priority, Pageable pageable);

    long countByStatusAndIsDeletedFalse(ProjectEnums.ProjectStatus status);
    long countByIsDeletedFalse();
}
