package com.erp.hr.designation;

import com.erp.common.ApiResponse;
import com.erp.hr.designation.dto.DesignationRequest;
import com.erp.hr.designation.dto.DesignationResponse;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/designations")
@RequiredArgsConstructor
public class DesignationController {

    private final DesignationService designationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<DesignationResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID departmentId,
            @PageableDefault(size = 20, sort = "title", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Designations fetched",
                designationService.getAll(search, departmentId, pageable)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DesignationResponse>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.ok("Active designations", designationService.getAllActive()));
    }

    @GetMapping("/by-department/{departmentId}")
    public ResponseEntity<ApiResponse<List<DesignationResponse>>> getByDepartment(@PathVariable UUID departmentId) {
        return ResponseEntity.ok(ApiResponse.ok("Designations by department",
                designationService.getByDepartment(departmentId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DesignationResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Designation fetched", designationService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DesignationResponse>> create(@Valid @RequestBody DesignationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Designation created", designationService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DesignationResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody DesignationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Designation updated", designationService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        designationService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Designation deleted", null));
    }
}
