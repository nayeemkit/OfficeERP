import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@shared/models/auth.model';
import { PageResponse } from '@shared/models/user.model';
import {
  DepartmentResponse, DepartmentRequest,
  DesignationResponse, DesignationRequest,
  EmployeeResponse, EmployeeRequest, EmployeeStats,
} from '@shared/models/hr.model';

@Injectable({ providedIn: 'root' })
export class HrService {
  private readonly BASE = `${environment.apiUrl}/v1/hr`;

  constructor(private http: HttpClient) {}

  // --- Departments ---

  getDepartments(page = 0, size = 20, search?: string): Observable<ApiResponse<PageResponse<DepartmentResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'name,asc');
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<PageResponse<DepartmentResponse>>>(`${this.BASE}/departments`, { params });
  }

  getActiveDepartments(): Observable<ApiResponse<DepartmentResponse[]>> {
    return this.http.get<ApiResponse<DepartmentResponse[]>>(`${this.BASE}/departments/active`);
  }

  createDepartment(req: DepartmentRequest): Observable<ApiResponse<DepartmentResponse>> {
    return this.http.post<ApiResponse<DepartmentResponse>>(`${this.BASE}/departments`, req);
  }

  updateDepartment(id: string, req: DepartmentRequest): Observable<ApiResponse<DepartmentResponse>> {
    return this.http.put<ApiResponse<DepartmentResponse>>(`${this.BASE}/departments/${id}`, req);
  }

  deleteDepartment(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE}/departments/${id}`);
  }

  // --- Designations ---

  getDesignations(page = 0, size = 20, search?: string, departmentId?: string): Observable<ApiResponse<PageResponse<DesignationResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'title,asc');
    if (search) params = params.set('search', search);
    if (departmentId) params = params.set('departmentId', departmentId);
    return this.http.get<ApiResponse<PageResponse<DesignationResponse>>>(`${this.BASE}/designations`, { params });
  }

  getActiveDesignations(): Observable<ApiResponse<DesignationResponse[]>> {
    return this.http.get<ApiResponse<DesignationResponse[]>>(`${this.BASE}/designations/active`);
  }

  getDesignationsByDepartment(departmentId: string): Observable<ApiResponse<DesignationResponse[]>> {
    return this.http.get<ApiResponse<DesignationResponse[]>>(`${this.BASE}/designations/by-department/${departmentId}`);
  }

  createDesignation(req: DesignationRequest): Observable<ApiResponse<DesignationResponse>> {
    return this.http.post<ApiResponse<DesignationResponse>>(`${this.BASE}/designations`, req);
  }

  updateDesignation(id: string, req: DesignationRequest): Observable<ApiResponse<DesignationResponse>> {
    return this.http.put<ApiResponse<DesignationResponse>>(`${this.BASE}/designations/${id}`, req);
  }

  deleteDesignation(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE}/designations/${id}`);
  }

  // --- Employees ---

  getEmployees(page = 0, size = 20, search?: string, departmentId?: string, status?: string): Observable<ApiResponse<PageResponse<EmployeeResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    if (search) params = params.set('search', search);
    if (departmentId) params = params.set('departmentId', departmentId);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PageResponse<EmployeeResponse>>>(`${this.BASE}/employees`, { params });
  }

  getEmployeeById(id: string): Observable<ApiResponse<EmployeeResponse>> {
    return this.http.get<ApiResponse<EmployeeResponse>>(`${this.BASE}/employees/${id}`);
  }

  createEmployee(req: EmployeeRequest): Observable<ApiResponse<EmployeeResponse>> {
    return this.http.post<ApiResponse<EmployeeResponse>>(`${this.BASE}/employees`, req);
  }

  updateEmployee(id: string, req: EmployeeRequest): Observable<ApiResponse<EmployeeResponse>> {
    return this.http.put<ApiResponse<EmployeeResponse>>(`${this.BASE}/employees/${id}`, req);
  }

  deleteEmployee(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE}/employees/${id}`);
  }

  getEmployeeStats(): Observable<ApiResponse<EmployeeStats>> {
    return this.http.get<ApiResponse<EmployeeStats>>(`${this.BASE}/employees/stats`);
  }
}
