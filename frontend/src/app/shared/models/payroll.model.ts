export interface SalaryStructureRequest {
  employeeId: string;
  basicSalary: number;
  houseAllowance?: number;
  transportAllowance?: number;
  medicalAllowance?: number;
  otherAllowance?: number;
  taxDeduction?: number;
  insuranceDeduction?: number;
  otherDeduction?: number;
  effectiveFrom: string;
}

export interface SalaryStructureResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  houseAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowance: number;
  taxDeduction: number;
  insuranceDeduction: number;
  otherDeduction: number;
  totalAllowances: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  effectiveFrom: string;
  isActive: boolean;
}

export interface PayslipResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  year: number;
  month: number;
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  workingDays: number;
  presentDays: number;
  status: 'DRAFT' | 'CONFIRMED' | 'PAID';
  paidAt: string | null;
  remarks: string;
  createdAt: string;
}

export interface GeneratePayrollRequest {
  year: number;
  month: number;
  employeeId?: string;
}

export interface PayrollStats {
  totalPayslips: number;
  draftCount: number;
  confirmedCount: number;
  paidCount: number;
}
