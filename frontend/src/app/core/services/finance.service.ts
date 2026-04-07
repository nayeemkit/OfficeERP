import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@shared/models/auth.model';
import { PageResponse } from '@shared/models/user.model';
import {
  ExpenseCategoryResponse, ExpenseCategoryRequest, ExpenseResponse,
  ExpenseRequest, ExpenseReviewRequest, ExpenseStats,
} from '@shared/models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly BASE = `${environment.apiUrl}/v1/finance/expenses`;
  constructor(private http: HttpClient) {}

  getCategories(): Observable<ApiResponse<ExpenseCategoryResponse[]>> {
    return this.http.get<ApiResponse<ExpenseCategoryResponse[]>>(`${this.BASE}/categories`);
  }
  createCategory(req: ExpenseCategoryRequest): Observable<ApiResponse<ExpenseCategoryResponse>> {
    return this.http.post<ApiResponse<ExpenseCategoryResponse>>(`${this.BASE}/categories`, req);
  }
  getExpenses(page = 0, size = 20, employeeId?: string, categoryId?: string, status?: string,
              dateFrom?: string, dateTo?: string): Observable<ApiResponse<PageResponse<ExpenseResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    if (employeeId) params = params.set('employeeId', employeeId);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (status) params = params.set('status', status);
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);
    return this.http.get<ApiResponse<PageResponse<ExpenseResponse>>>(this.BASE, { params });
  }
  submitExpense(req: ExpenseRequest): Observable<ApiResponse<ExpenseResponse>> {
    return this.http.post<ApiResponse<ExpenseResponse>>(this.BASE, req);
  }
  reviewExpense(id: string, req: ExpenseReviewRequest): Observable<ApiResponse<ExpenseResponse>> {
    return this.http.patch<ApiResponse<ExpenseResponse>>(`${this.BASE}/${id}/review`, req);
  }
  cancelExpense(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.BASE}/${id}/cancel`, {});
  }
  getStats(): Observable<ApiResponse<ExpenseStats>> {
    return this.http.get<ApiResponse<ExpenseStats>>(`${this.BASE}/stats`);
  }
}
