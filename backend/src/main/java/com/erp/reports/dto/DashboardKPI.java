package com.erp.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardKPI {

    // HR
    private long totalEmployees;
    private long activeEmployees;
    private long onLeaveToday;
    private long pendingLeaveRequests;
    private long checkedInToday;

    // Inventory
    private long totalItems;
    private long lowStockItems;
    private long totalAssets;
    private long assignedAssets;

    // Finance
    private BigDecimal totalApprovedExpenses;
    private BigDecimal totalPendingExpenses;
    private long pendingExpenseCount;
    private BigDecimal totalInvoicePaid;
    private BigDecimal totalInvoiceOutstanding;
    private long overdueInvoices;

    // Projects
    private long totalProjects;
    private long activeProjects;
    private long completedProjects;

    // Charts data
    private List<DepartmentHeadcount> departmentHeadcounts;
    private List<MonthlyExpense> monthlyExpenses;
    private List<ProjectStatusCount> projectStatusCounts;
    private Map<String, Long> attendanceThisWeek;
}
