export interface AttendanceResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE' | 'WEEKEND' | 'HOLIDAY';
  remarks: string;
}

export interface CheckInRequest {
  employeeId: string;
  remarks?: string;
}

export interface CheckOutRequest {
  employeeId: string;
  remarks?: string;
}

export interface ManualAttendanceRequest {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  remarks?: string;
}

export interface MonthlySummary {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  year: number;
  month: number;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  leaveDays: number;
  totalWorkHours: number;
  avgWorkHours: number;
  dailyRecords: AttendanceResponse[];
}

export interface DailyStats {
  date: string;
  totalCheckedIn: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  onLeave: number;
}
