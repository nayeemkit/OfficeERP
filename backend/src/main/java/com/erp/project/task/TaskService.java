package com.erp.project.task;

import com.erp.hr.employee.Employee;
import com.erp.hr.employee.EmployeeRepository;
import com.erp.project.*;
import com.erp.project.task.dto.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Slf4j @Service @RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectService projectService;

    public Page<TaskResponse> getByProject(UUID projectId, ProjectEnums.TaskStatus status, UUID assigneeId, Pageable pageable) {
        return taskRepository.findAllWithFilters(projectId, assigneeId,status,  pageable).map(this::toResponse);
    }

    @Transactional
    public TaskResponse create(TaskRequest req) {
        Project project = projectRepository.findByIdAndIsDeletedFalse(req.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        Employee assignee = null;
        if (req.getAssigneeId() != null) assignee = employeeRepository.findByIdAndIsDeletedFalse(req.getAssigneeId())
                .orElseThrow(() -> new EntityNotFoundException("Assignee not found"));
        Task t = Task.builder().project(project).title(req.getTitle()).description(req.getDescription())
                .assignee(assignee).priority(req.getPriority() != null ? req.getPriority() : ProjectEnums.Priority.MEDIUM)
                .status(req.getStatus() != null ? req.getStatus() : ProjectEnums.TaskStatus.TODO)
                .dueDate(req.getDueDate()).estimatedHours(req.getEstimatedHours()).build();
        t.setIsDeleted(false);
        taskRepository.save(t);
        projectService.recalculateProgress(project.getId());
        return toResponse(t);
    }

    @Transactional
    public TaskResponse update(UUID id, TaskRequest req) {
        Task t = findOrThrow(id);
        if (req.getTitle() != null) t.setTitle(req.getTitle());
        if (req.getDescription() != null) t.setDescription(req.getDescription());
        if (req.getAssigneeId() != null) {
            Employee a = employeeRepository.findByIdAndIsDeletedFalse(req.getAssigneeId())
                    .orElseThrow(() -> new EntityNotFoundException("Assignee not found"));
            t.setAssignee(a);
        }
        if (req.getPriority() != null) t.setPriority(req.getPriority());
        if (req.getStatus() != null) t.setStatus(req.getStatus());
        if (req.getDueDate() != null) t.setDueDate(req.getDueDate());
        if (req.getEstimatedHours() != null) t.setEstimatedHours(req.getEstimatedHours());
        if (req.getActualHours() != null) t.setActualHours(req.getActualHours());
        taskRepository.save(t);
        projectService.recalculateProgress(t.getProject().getId());
        return toResponse(t);
    }

    @Transactional
    public void delete(UUID id) {
        Task t = findOrThrow(id); t.setIsDeleted(true); taskRepository.save(t);
        projectService.recalculateProgress(t.getProject().getId());
    }

    private Task findOrThrow(UUID id) {
        return taskRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new EntityNotFoundException("Task not found"));
    }

    private TaskResponse toResponse(Task t) {
        return TaskResponse.builder().id(t.getId()).projectId(t.getProject().getId()).projectName(t.getProject().getName())
                .title(t.getTitle()).description(t.getDescription())
                .assigneeId(t.getAssignee() != null ? t.getAssignee().getId() : null)
                .assigneeName(t.getAssignee() != null ? t.getAssignee().getFullName() : null)
                .priority(t.getPriority()).status(t.getStatus()).dueDate(t.getDueDate())
                .estimatedHours(t.getEstimatedHours()).actualHours(t.getActualHours()).createdAt(t.getCreatedAt()).build();
    }
}
