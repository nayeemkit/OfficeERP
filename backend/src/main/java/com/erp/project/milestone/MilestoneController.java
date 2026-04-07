package com.erp.project.milestone;

import com.erp.common.ApiResponse;
import com.erp.project.milestone.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/projects/milestones") @RequiredArgsConstructor
public class MilestoneController {
    private final MilestoneService milestoneService;

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> getByProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(ApiResponse.ok("Milestones fetched", milestoneService.getByProject(projectId)));
    }

    @PostMapping @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<MilestoneResponse>> create(@Valid @RequestBody MilestoneRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Milestone created", milestoneService.create(req)));
    }

    @PatchMapping("/{id}/toggle") @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<MilestoneResponse>> toggle(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Milestone toggled", milestoneService.toggleComplete(id)));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        milestoneService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}
