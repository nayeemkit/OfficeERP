export interface LeaveTypeResponse {
  id: string;
  name: string;
  description: string;
  defaultDays: number;
  isPaid: boolean;
  isActive: boolean;
}

export interface LeaveBalanceResponse {
  id: string;
  leaveTypeId: string;
  leaveTypeName: string;
  isPaid: boolean;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
}

export interface LeaveRequestResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewComment: string | null;
  createdAt: string;
}

export interface LeaveRequestDTO {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface LeaveReviewDTO {
  status: 'APPROVED' | 'REJECTED';
  comment?: string;
}

export interface LeaveStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}
