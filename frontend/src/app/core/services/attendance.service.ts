import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@shared/models/auth.model';
import { PageResponse } from '@shared/models/user.model';
import {
  AttendanceResponse, CheckInRequest, CheckOutRequest,
  ManualAttendanceRequest, MonthlySummary, DailyStats,
} from '@shared/models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly BASE = `${environment.apiUrl}/v1/hr/attendance`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20, employeeId?: string, departmentId?: string,
         status?: string, dateFrom?: string, dateTo?: string): Observable<ApiResponse<PageResponse<AttendanceResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'date,desc');
    if (employeeId) params = params.set('employeeId', employeeId);
    if (departmentId) params = params.set('departmentId', departmentId);
    if (status) params = params.set('status', status);
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);
    return this.http.get<ApiResponse<PageResponse<AttendanceResponse>>>(this.BASE, { params });
  }

  checkIn(request: CheckInRequest): Observable<ApiResponse<AttendanceResponse>> {
    return this.http.post<ApiResponse<AttendanceResponse>>(`${this.BASE}/check-in`, request);
  }

  checkOut(request: CheckOutRequest): Observable<ApiResponse<AttendanceResponse>> {
    return this.http.post<ApiResponse<AttendanceResponse>>(`${this.BASE}/check-out`, request);
  }

  markManual(request: ManualAttendanceRequest): Observable<ApiResponse<AttendanceResponse>> {
    return this.http.post<ApiResponse<AttendanceResponse>>(`${this.BASE}/manual`, request);
  }

  getMonthlySummary(employeeId: string, year: number, month: number): Observable<ApiResponse<MonthlySummary>> {
    return this.http.get<ApiResponse<MonthlySummary>>(`${this.BASE}/summary/${employeeId}`, {
      params: new HttpParams().set('year', year).set('month', month),
    });
  }

  getDailyStats(date?: string): Observable<ApiResponse<DailyStats>> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ApiResponse<DailyStats>>(`${this.BASE}/daily-stats`, { params });
  }
}
