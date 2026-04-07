package com.erp.project.task;

import com.erp.common.ApiResponse;
import com.erp.project.ProjectEnums;
import com.erp.project.task.dto.*;
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

@RestController @RequestMapping("/api/v1/projects/tasks") @RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> getByProject(
            @PathVariable UUID projectId, @RequestParam(required = false) ProjectEnums.TaskStatus status,
            @RequestParam(required = false) UUID assigneeId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Tasks fetched", taskService.getByProject(projectId, status, assigneeId, pageable)));
    }

    @PostMapping @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskResponse>> create(@Valid @RequestBody TaskRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Task created", taskService.create(req)));
    }

    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskResponse>> update(@PathVariable UUID id, @Valid @RequestBody TaskRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Task updated", taskService.update(id, req)));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        taskService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}
