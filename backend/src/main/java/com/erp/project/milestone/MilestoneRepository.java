package com.erp.project.milestone;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MilestoneRepository extends JpaRepository<ProjectMilestone, UUID> {

    Optional<ProjectMilestone> findByIdAndIsDeletedFalse(UUID id);

    List<ProjectMilestone> findByProjectIdAndIsDeletedFalseOrderByTargetDateAsc(UUID projectId);

    long countByProjectIdAndIsDeletedFalse(UUID projectId);

    long countByProjectIdAndIsCompletedTrueAndIsDeletedFalse(UUID projectId);
}
