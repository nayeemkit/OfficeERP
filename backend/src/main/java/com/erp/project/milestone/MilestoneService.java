package com.erp.project.milestone;

import com.erp.project.Project;
import com.erp.project.ProjectRepository;
import com.erp.project.milestone.dto.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    public List<MilestoneResponse> getByProject(UUID projectId) {
        return milestoneRepository.findByProjectIdAndIsDeletedFalseOrderByTargetDateAsc(projectId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public MilestoneResponse create(MilestoneRequest req) {
        Project p = projectRepository.findByIdAndIsDeletedFalse(req.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        ProjectMilestone m = ProjectMilestone.builder()
                .project(p)
                .name(req.getName())
                .description(req.getDescription())
                .targetDate(req.getTargetDate())
                .isCompleted(false)
                .build();
        m.setIsDeleted(false);
        milestoneRepository.save(m);
        return toResponse(m);
    }

    @Transactional
    public MilestoneResponse toggleComplete(UUID id) {
        ProjectMilestone m = milestoneRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Milestone not found"));
        m.setIsCompleted(!m.getIsCompleted());
        m.setCompletedDate(m.getIsCompleted() ? LocalDate.now() : null);
        milestoneRepository.save(m);
        return toResponse(m);
    }

    @Transactional
    public void delete(UUID id) {
        ProjectMilestone m = milestoneRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Milestone not found"));
        m.setIsDeleted(true);
        milestoneRepository.save(m);
    }

    private MilestoneResponse toResponse(ProjectMilestone m) {
        return MilestoneResponse.builder()
                .id(m.getId())
                .projectId(m.getProject().getId())
                .name(m.getName())
                .description(m.getDescription())
                .targetDate(m.getTargetDate())
                .completedDate(m.getCompletedDate())
                .isCompleted(m.getIsCompleted())
                .build();
    }
}
