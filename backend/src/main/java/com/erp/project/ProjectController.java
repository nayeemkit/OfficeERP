package com.erp.project;

import com.erp.common.ApiResponse;
import com.erp.project.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/projects") @RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getAll(
            @RequestParam(required = false) String search, @RequestParam(required = false) ProjectEnums.ProjectStatus status,
            @RequestParam(required = false) ProjectEnums.Priority priority,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Projects fetched", projectService.getAll(search, status, priority, pageable)));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Project fetched", projectService.getById(id)));
    }
    @PostMapping @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProjectResponse>> create(@Valid @RequestBody ProjectRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Project created", projectService.create(req)));
    }
    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ProjectResponse>> update(@PathVariable UUID id, @Valid @RequestBody ProjectRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", projectService.update(id, req)));
    }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        projectService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ProjectStats>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok("Stats", projectService.getStats()));
    }
}
