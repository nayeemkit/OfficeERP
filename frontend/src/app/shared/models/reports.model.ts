export interface DashboardKPI {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
  checkedInToday: number;
  totalItems: number;
  lowStockItems: number;
  totalAssets: number;
  assignedAssets: number;
  totalApprovedExpenses: number;
  totalPendingExpenses: number;
  pendingExpenseCount: number;
  totalInvoicePaid: number;
  totalInvoiceOutstanding: number;
  overdueInvoices: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  departmentHeadcounts: { departmentName: string; count: number }[];
  monthlyExpenses: { month: number; monthName: string; amount: number }[];
  projectStatusCounts: { status: string; count: number }[];
  attendanceThisWeek: { [key: string]: number };
}
