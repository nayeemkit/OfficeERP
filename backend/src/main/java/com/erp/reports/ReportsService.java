package com.erp.reports;

import com.erp.finance.expense.ExpenseRepository;
import com.erp.finance.expense.ExpenseStatus;
import com.erp.finance.invoice.InvoiceRepository;
import com.erp.finance.invoice.InvoiceStatus;
import com.erp.hr.attendance.AttendanceRepository;
import com.erp.hr.attendance.AttendanceStatus;
import com.erp.hr.department.DepartmentRepository;
import com.erp.hr.employee.EmployeeEnums;
import com.erp.hr.employee.EmployeeRepository;
import com.erp.hr.leave.LeaveEnums;
import com.erp.hr.leave.LeaveRequestRepository;
import com.erp.inventory.asset.AssetEnums;
import com.erp.inventory.asset.AssetRepository;
import com.erp.inventory.item.ItemRepository;
import com.erp.project.ProjectEnums;
import com.erp.project.ProjectRepository;
import com.erp.reports.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportsService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ItemRepository itemRepository;
    private final AssetRepository assetRepository;
    private final ExpenseRepository expenseRepository;
    private final InvoiceRepository invoiceRepository;
    private final ProjectRepository projectRepository;

    public DashboardKPI getDashboardKPI() {
        LocalDate today = LocalDate.now();

        // Department headcounts
        List<DepartmentHeadcount> headcounts = departmentRepository.findAllByIsDeletedFalseAndIsActiveTrue()
                .stream().map(d -> DepartmentHeadcount.builder()
                        .departmentName(d.getName())
                        .count(employeeRepository.countByDepartmentIdAndIsDeletedFalse(d.getId()))
                        .build())
                .filter(h -> h.getCount() > 0)
                .collect(Collectors.toList());

        // Monthly expenses for current year
        int currentYear = today.getYear();
        List<MonthlyExpense> monthlyExpenses = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            String monthName = Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            // Use a simple approach - count approved expenses per month
            monthlyExpenses.add(MonthlyExpense.builder()
                    .month(m)
                    .monthName(monthName)
                    .amount(BigDecimal.ZERO) // Will be populated if we add monthly queries
                    .build());
        }

        // Project status counts
        List<ProjectStatusCount> projectCounts = Arrays.stream(ProjectEnums.ProjectStatus.values())
                .map(s -> ProjectStatusCount.builder()
                        .status(s.name())
                        .count(projectRepository.countByStatusAndIsDeletedFalse(s))
                        .build())
                .filter(p -> p.getCount() > 0)
                .collect(Collectors.toList());

        // Attendance this week
        Map<String, Long> weekAttendance = new LinkedHashMap<>();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        for (int i = 0; i < 7; i++) {
            LocalDate day = startOfWeek.plusDays(i);
            String dayName = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            long count = attendanceRepository.countCheckedInByDate(day);
            weekAttendance.put(dayName, count);
        }

        return DashboardKPI.builder()
                // HR
                .totalEmployees(employeeRepository.countByIsDeletedFalse())
                .activeEmployees(employeeRepository.countByStatusAndIsDeletedFalse(EmployeeEnums.EmployeeStatus.ACTIVE))
                .onLeaveToday(attendanceRepository.countByDateAndStatus(today, AttendanceStatus.ON_LEAVE))
                .pendingLeaveRequests(leaveRequestRepository.countByStatusAndIsDeletedFalse(LeaveEnums.LeaveStatus.PENDING))
                .checkedInToday(attendanceRepository.countCheckedInByDate(today))
                // Inventory
                .totalItems(itemRepository.countByIsDeletedFalse())
                .lowStockItems(itemRepository.countLowStock())
                .totalAssets(assetRepository.countByIsDeletedFalse())
                .assignedAssets(assetRepository.countByStatusAndIsDeletedFalse(AssetEnums.AssetStatus.ASSIGNED))
                // Finance
                .totalApprovedExpenses(expenseRepository.sumApprovedAmount())
                .totalPendingExpenses(expenseRepository.sumPendingAmount())
                .pendingExpenseCount(expenseRepository.countByStatusAndIsDeletedFalse(ExpenseStatus.PENDING))
                .totalInvoicePaid(invoiceRepository.sumByStatus(InvoiceStatus.PAID))
                .totalInvoiceOutstanding(invoiceRepository.sumByStatus(InvoiceStatus.SENT))
                .overdueInvoices((long) invoiceRepository.findOverdueInvoices(today).size())
                // Projects
                .totalProjects(projectRepository.countByIsDeletedFalse())
                .activeProjects(projectRepository.countByStatusAndIsDeletedFalse(ProjectEnums.ProjectStatus.IN_PROGRESS))
                .completedProjects(projectRepository.countByStatusAndIsDeletedFalse(ProjectEnums.ProjectStatus.COMPLETED))
                // Charts
                .departmentHeadcounts(headcounts)
                .monthlyExpenses(monthlyExpenses)
                .projectStatusCounts(projectCounts)
                .attendanceThisWeek(weekAttendance)
                .build();
    }
}
