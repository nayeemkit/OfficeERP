import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@shared/models/auth.model';
import { PageResponse } from '@shared/models/user.model';
import {
  LeaveTypeResponse, LeaveBalanceResponse, LeaveRequestResponse,
  LeaveRequestDTO, LeaveReviewDTO, LeaveStats,
} from '@shared/models/leave.model';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private readonly BASE = `${environment.apiUrl}/v1/hr/leave`;

  constructor(private http: HttpClient) {}

  getLeaveTypes(): Observable<ApiResponse<LeaveTypeResponse[]>> {
    return this.http.get<ApiResponse<LeaveTypeResponse[]>>(`${this.BASE}/types`);
  }

  getBalances(employeeId: string, year?: number): Observable<ApiResponse<LeaveBalanceResponse[]>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http.get<ApiResponse<LeaveBalanceResponse[]>>(`${this.BASE}/balances/${employeeId}`, { params });
  }

  initBalances(employeeId: string, year?: number): Observable<ApiResponse<void>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http.post<ApiResponse<void>>(`${this.BASE}/balances/init/${employeeId}`, {}, { params });
  }

  getLeaveRequests(page = 0, size = 20, employeeId?: string, status?: string, departmentId?: string): Observable<ApiResponse<PageResponse<LeaveRequestResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    if (employeeId) params = params.set('employeeId', employeeId);
    if (status) params = params.set('status', status);
    if (departmentId) params = params.set('departmentId', departmentId);
    return this.http.get<ApiResponse<PageResponse<LeaveRequestResponse>>>(`${this.BASE}/requests`, { params });
  }

  applyLeave(request: LeaveRequestDTO): Observable<ApiResponse<LeaveRequestResponse>> {
    return this.http.post<ApiResponse<LeaveRequestResponse>>(`${this.BASE}/requests`, request);
  }

  reviewLeave(id: string, review: LeaveReviewDTO): Observable<ApiResponse<LeaveRequestResponse>> {
    return this.http.patch<ApiResponse<LeaveRequestResponse>>(`${this.BASE}/requests/${id}/review`, review);
  }

  cancelLeave(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.BASE}/requests/${id}/cancel`, {});
  }

  getStats(departmentId?: string): Observable<ApiResponse<LeaveStats>> {
    let params = new HttpParams();
    if (departmentId) params = params.set('departmentId', departmentId);
    return this.http.get<ApiResponse<LeaveStats>>(`${this.BASE}/stats`, { params });
  }
}
