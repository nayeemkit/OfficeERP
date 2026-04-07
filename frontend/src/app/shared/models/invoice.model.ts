export interface InvoiceResponse {
  id: string; invoiceNumber: string; clientName: string; clientEmail: string;
  clientAddress: string; amount: number; taxAmount: number; totalAmount: number;
  issueDate: string; dueDate: string; paidDate: string | null;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'; notes: string; createdAt: string;
}
export interface InvoiceRequest {
  clientName: string; clientEmail?: string; clientAddress?: string;
  amount: number; taxAmount?: number; issueDate: string; dueDate: string; notes?: string;
}
export interface InvoiceStats {
  totalInvoices: number; draftCount: number; sentCount: number;
  paidCount: number; overdueCount: number; totalPaid: number; totalOutstanding: number;
}

export interface BudgetResponse {
  id: string; departmentId: string; departmentName: string;
  year: number; month: number; allocated: number; spent: number;
  remaining: number; utilization: number; notes: string;
}
export interface BudgetRequest {
  departmentId: string; year: number; month: number;
  allocated: number; spent?: number; notes?: string;
}
export interface BudgetStats {
  totalAllocated: number; totalSpent: number; totalRemaining: number; overallUtilization: number;
}
