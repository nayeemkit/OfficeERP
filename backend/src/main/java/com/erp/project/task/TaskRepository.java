package com.erp.project.task;

import com.erp.project.ProjectEnums;
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
public interface TaskRepository extends JpaRepository<Task, UUID> {
    Optional<Task> findByIdAndIsDeletedFalse(UUID id);

    @Query("""
        SELECT t FROM Task t LEFT JOIN FETCH t.assignee LEFT JOIN FETCH t.project
        WHERE t.isDeleted = false AND t.project.id = :projectId
        ORDER BY t.sortOrder ASC, t.createdAt DESC
    """)
    List<Task> findByProjectId(@Param("projectId") UUID projectId);

    @Query("""
        SELECT t FROM Task t LEFT JOIN FETCH t.assignee LEFT JOIN FETCH t.project
        WHERE t.isDeleted = false
        AND (:projectId IS NULL OR t.project.id = :projectId)
        AND (:assigneeId IS NULL OR t.assignee.id = :assigneeId)
        AND (:status IS NULL OR t.status = :status)
    """)
    Page<Task> findAllWithFilters(@Param("projectId") UUID projectId,
            @Param("assigneeId") UUID assigneeId,
            @Param("status") ProjectEnums.TaskStatus status, Pageable pageable);

    long countByProjectIdAndIsDeletedFalse(UUID projectId);
    long countByProjectIdAndStatusAndIsDeletedFalse(UUID projectId, ProjectEnums.TaskStatus status);
}
