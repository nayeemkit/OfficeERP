export interface DepartmentResponse {
  id: string;
  name: string;
  description: string;
  managerId: string | null;
  managerName: string | null;
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
}

export interface DepartmentRequest {
  name: string;
  description?: string;
  managerId?: string;
  isActive?: boolean;
}

export interface DesignationResponse {
  id: string;
  title: string;
  description: string;
  departmentId: string | null;
  departmentName: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface DesignationRequest {
  title: string;
  description?: string;
  departmentId?: string;
  isActive?: boolean;
}

export interface EmployeeResponse {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designationId: string | null;
  designationTitle: string | null;
  reportingTo: string | null;
  joinDate: string;
  salary: number;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED';
  address: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  createdAt: string;
}

export interface EmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  designationId?: string;
  reportingTo?: string;
  joinDate: string;
  salary?: number;
  employmentType?: string;
  status?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  resigned: number;
}
