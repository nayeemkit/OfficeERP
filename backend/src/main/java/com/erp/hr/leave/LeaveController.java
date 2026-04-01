package com.erp.hr.leave;

import com.erp.common.ApiResponse;
import com.erp.hr.leave.dto.*;
import com.erp.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/leave")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    // --- Leave Types ---

    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<LeaveTypeResponse>>> getLeaveTypes() {
        return ResponseEntity.ok(ApiResponse.ok("Leave types fetched", leaveService.getAllLeaveTypes()));
    }

    // --- Leave Balances ---

    @GetMapping("/balances/{employeeId}")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> getBalances(
            @PathVariable UUID employeeId,
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Balances fetched",
                leaveService.getEmployeeBalances(employeeId, year)));
    }

    @PostMapping("/balances/init/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> initBalances(
            @PathVariable UUID employeeId,
            @RequestParam(required = false) Integer year
    ) {
        leaveService.initializeBalancesForEmployee(employeeId, year);
        return ResponseEntity.ok(ApiResponse.ok("Balances initialized", null));
    }

    // --- Leave Requests ---

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<LeaveRequestResponse>>> getLeaveRequests(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) LeaveEnums.LeaveStatus status,
            @RequestParam(required = false) UUID departmentId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Leave requests fetched",
                leaveService.getLeaveRequests(employeeId, status, departmentId, pageable)));
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> getLeaveRequest(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Leave request fetched", leaveService.getLeaveRequestById(id)));
    }

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> applyLeave(
            @Valid @RequestBody LeaveRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Leave applied", leaveService.applyLeave(request)));
    }

    @PatchMapping("/requests/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> reviewLeave(
            @PathVariable UUID id,
            @Valid @RequestBody LeaveReviewDTO review,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Leave reviewed",
                leaveService.reviewLeave(id, review, currentUser.getId())));
    }

    @PatchMapping("/requests/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelLeave(@PathVariable UUID id) {
        leaveService.cancelLeave(id);
        return ResponseEntity.ok(ApiResponse.ok("Leave cancelled", null));
    }

    // --- Stats ---

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeaveStats>> getStats(
            @RequestParam(required = false) UUID departmentId
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Leave stats", leaveService.getStats(departmentId)));
    }
}
