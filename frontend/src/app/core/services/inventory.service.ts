import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@shared/models/auth.model';
import { PageResponse } from '@shared/models/user.model';
import {
  CategoryResponse, CategoryRequest, ItemResponse, ItemRequest,
  StockTransactionResponse, StockTransactionRequest, InventoryStats,
} from '@shared/models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly BASE = `${environment.apiUrl}/v1/inventory`;

  constructor(private http: HttpClient) {}

  // --- Categories ---
  getCategories(): Observable<ApiResponse<CategoryResponse[]>> {
    return this.http.get<ApiResponse<CategoryResponse[]>>(`${this.BASE}/categories`);
  }

  createCategory(req: CategoryRequest): Observable<ApiResponse<CategoryResponse>> {
    return this.http.post<ApiResponse<CategoryResponse>>(`${this.BASE}/categories`, req);
  }

  deleteCategory(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE}/categories/${id}`);
  }

  // --- Items ---
  getItems(page = 0, size = 20, search?: string, categoryId?: string, isActive?: boolean): Observable<ApiResponse<PageResponse<ItemResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (isActive !== undefined && isActive !== null) params = params.set('isActive', isActive.toString());
    return this.http.get<ApiResponse<PageResponse<ItemResponse>>>(` ${this.BASE}/items`, { params });
  }

  createItem(req: ItemRequest): Observable<ApiResponse<ItemResponse>> {
    return this.http.post<ApiResponse<ItemResponse>>(`${this.BASE}/items`, req);
  }

  updateItem(id: string, req: ItemRequest): Observable<ApiResponse<ItemResponse>> {
    return this.http.put<ApiResponse<ItemResponse>>(`${this.BASE}/items/${id}`, req);
  }

  deleteItem(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE}/items/${id}`);
  }

  getLowStockItems(): Observable<ApiResponse<ItemResponse[]>> {
    return this.http.get<ApiResponse<ItemResponse[]>>(`${this.BASE}/items/low-stock`);
  }

  // --- Stock ---
  getStockTransactions(page = 0, size = 20, itemId?: string, type?: string, dateFrom?: string, dateTo?: string): Observable<ApiResponse<PageResponse<StockTransactionResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'transactionDate,desc');
    if (itemId) params = params.set('itemId', itemId);
    if (type) params = params.set('type', type);
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);
    return this.http.get<ApiResponse<PageResponse<StockTransactionResponse>>>(`${this.BASE}/stock`, { params });
  }

  createStockTransaction(req: StockTransactionRequest): Observable<ApiResponse<StockTransactionResponse>> {
    return this.http.post<ApiResponse<StockTransactionResponse>>(`${this.BASE}/stock`, req);
  }

  // --- Stats ---
  getStats(): Observable<ApiResponse<InventoryStats>> {
    return this.http.get<ApiResponse<InventoryStats>>(`${this.BASE}/stats`);
  }
}
