import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@shared/models/auth.model';
import { PageResponse } from '@shared/models/user.model';
import {
  InvoiceResponse, InvoiceRequest, InvoiceStats,
  BudgetResponse, BudgetRequest, BudgetStats,
} from '@shared/models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly BASE = `${environment.apiUrl}/v1/finance/invoices`;
  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20, search?: string, status?: string): Observable<ApiResponse<PageResponse<InvoiceResponse>>> {
    let p = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    if (search) p = p.set('search', search);
    if (status) p = p.set('status', status);
    return this.http.get<ApiResponse<PageResponse<InvoiceResponse>>>(this.BASE, { params: p });
  }

  create(req: InvoiceRequest): Observable<ApiResponse<InvoiceResponse>> {
    return this.http.post<ApiResponse<InvoiceResponse>>(this.BASE, req);
  }

  update(id: string, req: InvoiceRequest): Observable<ApiResponse<InvoiceResponse>> {
    return this.http.put<ApiResponse<InvoiceResponse>>(`${this.BASE}/${id}`, req);
  }

  changeStatus(id: string, status: string): Observable<ApiResponse<InvoiceResponse>> {
    return this.http.patch<ApiResponse<InvoiceResponse>>(`${this.BASE}/${id}/status`, {}, {
      params: new HttpParams().set('status', status),
    });
  }

  deleteInvoice(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE}/${id}`);
  }

  getStats(): Observable<ApiResponse<InvoiceStats>> {
    return this.http.get<ApiResponse<InvoiceStats>>(`${this.BASE}/stats`);
  }
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly BASE = `${environment.apiUrl}/v1/finance/budgets`;
  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20, departmentId?: string, year?: number, month?: number): Observable<ApiResponse<PageResponse<BudgetResponse>>> {
    let p = new HttpParams().set('page', page).set('size', size).set('sort', 'year,desc');
    if (departmentId) p = p.set('departmentId', departmentId);
    if (year) p = p.set('year', year);
    if (month) p = p.set('month', month);
    return this.http.get<ApiResponse<PageResponse<BudgetResponse>>>(this.BASE, { params: p });
  }

  save(req: BudgetRequest): Observable<ApiResponse<BudgetResponse>> {
    return this.http.post<ApiResponse<BudgetResponse>>(this.BASE, req);
  }

  deleteBudget(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE}/${id}`);
  }

  getStats(year?: number): Observable<ApiResponse<BudgetStats>> {
    let p = new HttpParams();
    if (year) p = p.set('year', year);
    return this.http.get<ApiResponse<BudgetStats>>(`${this.BASE}/stats`, { params: p });
  }
}
