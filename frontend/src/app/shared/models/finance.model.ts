export interface ExpenseCategoryResponse {
  id: string; name: string; description: string; budgetLimit: number | null; isActive: boolean;
}
export interface ExpenseCategoryRequest { name: string; description?: string; budgetLimit?: number; }

export interface ExpenseResponse {
  id: string; expenseNumber: string; employeeId: string; employeeName: string;
  employeeCode: string; departmentName: string; categoryId: string; categoryName: string;
  amount: number; expenseDate: string; description: string; receiptRef: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewedByName: string | null; reviewedAt: string | null; reviewComment: string | null;
  createdAt: string;
}
export interface ExpenseRequest {
  employeeId: string; categoryId: string; amount: number;
  expenseDate: string; description: string; receiptRef?: string;
}
export interface ExpenseReviewRequest { status: 'APPROVED' | 'REJECTED'; comment?: string; }
export interface ExpenseStats {
  totalExpenses: number; pendingCount: number; approvedCount: number; rejectedCount: number;
  totalApprovedAmount: number; totalPendingAmount: number;
}
