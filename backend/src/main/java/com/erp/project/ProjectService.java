package com.erp.project;

import com.erp.hr.employee.Employee;
import com.erp.hr.employee.EmployeeRepository;
import com.erp.project.dto.*;
import com.erp.project.milestone.MilestoneRepository;
import com.erp.project.task.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Slf4j @Service @RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final MilestoneRepository milestoneRepository;
    private final EmployeeRepository employeeRepository;

    public Page<ProjectResponse> getAll(String search, ProjectEnums.ProjectStatus status,
                                         ProjectEnums.Priority priority, Pageable pageable) {
        return projectRepository.findAllWithFilters(search, status, priority, pageable).map(this::toResponse);
    }

    public ProjectResponse getById(UUID id) { return toResponse(findOrThrow(id)); }

    @Transactional
    public ProjectResponse create(ProjectRequest req) {
        Employee owner = null;
        if (req.getOwnerId() != null) owner = employeeRepository.findByIdAndIsDeletedFalse(req.getOwnerId())
                .orElseThrow(() -> new EntityNotFoundException("Owner not found"));
        Project p = Project.builder().name(req.getName()).description(req.getDescription())
                .startDate(req.getStartDate()).endDate(req.getEndDate())
                .status(req.getStatus() != null ? req.getStatus() : ProjectEnums.ProjectStatus.PLANNING)
                .priority(req.getPriority() != null ? req.getPriority() : ProjectEnums.Priority.MEDIUM)
                .owner(owner).progress(0).build();
        p.setIsDeleted(false);
        projectRepository.save(p);
        log.info("Project created: {}", p.getName());
        return toResponse(p);
    }

    @Transactional
    public ProjectResponse update(UUID id, ProjectRequest req) {
        Project p = findOrThrow(id);
        if (req.getName() != null) p.setName(req.getName());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getStartDate() != null) p.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) p.setEndDate(req.getEndDate());
        if (req.getStatus() != null) p.setStatus(req.getStatus());
        if (req.getPriority() != null) p.setPriority(req.getPriority());
        if (req.getOwnerId() != null) {
            Employee owner = employeeRepository.findByIdAndIsDeletedFalse(req.getOwnerId())
                    .orElseThrow(() -> new EntityNotFoundException("Owner not found"));
            p.setOwner(owner);
        }
        projectRepository.save(p);
        return toResponse(p);
    }

    @Transactional
    public void delete(UUID id) { Project p = findOrThrow(id); p.setIsDeleted(true); projectRepository.save(p); }

    @Transactional
    public void recalculateProgress(UUID projectId) {
        Project p = findOrThrow(projectId);
        long total = taskRepository.countByProjectIdAndIsDeletedFalse(projectId);
        long done = taskRepository.countByProjectIdAndStatusAndIsDeletedFalse(projectId, ProjectEnums.TaskStatus.DONE);
        int progress = total > 0 ? (int) ((done * 100) / total) : 0;
        p.setProgress(progress);
        projectRepository.save(p);
    }

    public ProjectStats getStats() {
        return ProjectStats.builder()
                .totalProjects(projectRepository.countByIsDeletedFalse())
                .planning(projectRepository.countByStatusAndIsDeletedFalse(ProjectEnums.ProjectStatus.PLANNING))
                .inProgress(projectRepository.countByStatusAndIsDeletedFalse(ProjectEnums.ProjectStatus.IN_PROGRESS))
                .completed(projectRepository.countByStatusAndIsDeletedFalse(ProjectEnums.ProjectStatus.COMPLETED))
                .onHold(projectRepository.countByStatusAndIsDeletedFalse(ProjectEnums.ProjectStatus.ON_HOLD))
                .build();
    }

    private Project findOrThrow(UUID id) {
        return projectRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }

    private ProjectResponse toResponse(Project p) {
        long tasks = taskRepository.countByProjectIdAndIsDeletedFalse(p.getId());
        long doneTasks = taskRepository.countByProjectIdAndStatusAndIsDeletedFalse(p.getId(), ProjectEnums.TaskStatus.DONE);
        long milestones = milestoneRepository.countByProjectIdAndIsDeletedFalse(p.getId());
        long doneMilestones = milestoneRepository.countByProjectIdAndIsCompletedTrueAndIsDeletedFalse(p.getId());
        return ProjectResponse.builder()
                .id(p.getId()).name(p.getName()).description(p.getDescription())
                .startDate(p.getStartDate()).endDate(p.getEndDate()).status(p.getStatus())
                .priority(p.getPriority()).ownerId(p.getOwner() != null ? p.getOwner().getId() : null)
                .ownerName(p.getOwner() != null ? p.getOwner().getFullName() : null)
                .progress(p.getProgress()).taskCount(tasks).completedTasks(doneTasks)
                .milestoneCount(milestones).completedMilestones(doneMilestones).createdAt(p.getCreatedAt()).build();
    }
}
