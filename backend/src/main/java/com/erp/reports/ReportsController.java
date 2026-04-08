package com.erp.reports;

import com.erp.common.ApiResponse;
import com.erp.reports.dto.DashboardKPI;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardKPI>> getDashboardKPI() {
        return ResponseEntity.ok(ApiResponse.ok("Dashboard KPI fetched", reportsService.getDashboardKPI()));
    }
}
