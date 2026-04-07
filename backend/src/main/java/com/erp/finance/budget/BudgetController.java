package com.erp.finance.budget;

import com.erp.common.ApiResponse;
import com.erp.finance.budget.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController @RequestMapping("/api/v1/finance/budgets") @RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BudgetResponse>>> getAll(
            @RequestParam(required = false) UUID departmentId, @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @PageableDefault(size = 20, sort = "year", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Budgets fetched", budgetService.getAll(departmentId, year, month, pageable)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BudgetResponse>> createOrUpdate(@Valid @RequestBody BudgetRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Budget saved", budgetService.createOrUpdate(req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        budgetService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<BudgetStats>> getStats(@RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(ApiResponse.ok("Budget stats", budgetService.getStats(year)));
    }
}
