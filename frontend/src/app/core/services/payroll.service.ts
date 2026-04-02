import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@shared/models/auth.model';
import { PageResponse } from '@shared/models/user.model';
import {
  SalaryStructureRequest, SalaryStructureResponse,
  PayslipResponse, GeneratePayrollRequest, PayrollStats,
} from '@shared/models/payroll.model';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private readonly BASE = `${environment.apiUrl}/v1/hr/payroll`;

  constructor(private http: HttpClient) {}

  getSalaryStructure(employeeId: string): Observable<ApiResponse<SalaryStructureResponse>> {
    return this.http.get<ApiResponse<SalaryStructureResponse>>(`${this.BASE}/salary/${employeeId}`);
  }

  saveSalaryStructure(req: SalaryStructureRequest): Observable<ApiResponse<SalaryStructureResponse>> {
    return this.http.post<ApiResponse<SalaryStructureResponse>>(`${this.BASE}/salary`, req);
  }

  getPayslips(page = 0, size = 20, employeeId?: string, year?: number, month?: number, status?: string): Observable<ApiResponse<PageResponse<PayslipResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    if (employeeId) params = params.set('employeeId', employeeId);
    if (year) params = params.set('year', year);
    if (month) params = params.set('month', month);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PageResponse<PayslipResponse>>>(`${this.BASE}/payslips`, { params });
  }

  generatePayroll(req: GeneratePayrollRequest): Observable<ApiResponse<PayslipResponse[]>> {
    return this.http.post<ApiResponse<PayslipResponse[]>>(`${this.BASE}/generate`, req);
  }

  confirmPayslip(id: string): Observable<ApiResponse<PayslipResponse>> {
    return this.http.patch<ApiResponse<PayslipResponse>>(`${this.BASE}/payslips/${id}/confirm`, {});
  }

  markAsPaid(id: string): Observable<ApiResponse<PayslipResponse>> {
    return this.http.patch<ApiResponse<PayslipResponse>>(`${this.BASE}/payslips/${id}/pay`, {});
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.BASE}/payslips/${id}/pdf`, { responseType: 'blob' });
  }

  getStats(year?: number, month?: number): Observable<ApiResponse<PayrollStats>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    if (month) params = params.set('month', month);
    return this.http.get<ApiResponse<PayrollStats>>(`${this.BASE}/stats`, { params });
  }
}
