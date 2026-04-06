import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@shared/models/auth.model';
import { PageResponse } from '@shared/models/user.model';
import {
  AssetResponse, AssetRequest, AssignAssetRequest,
  AssetHistoryResponse, AssetStats,
} from '@shared/models/asset.model';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private readonly BASE = `${environment.apiUrl}/v1/inventory/assets`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20, search?: string, categoryId?: string, status?: string): Observable<ApiResponse<PageResponse<AssetResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PageResponse<AssetResponse>>>(this.BASE, { params });
  }

  create(req: AssetRequest): Observable<ApiResponse<AssetResponse>> {
    return this.http.post<ApiResponse<AssetResponse>>(this.BASE, req);
  }

  update(id: string, req: AssetRequest): Observable<ApiResponse<AssetResponse>> {
    return this.http.put<ApiResponse<AssetResponse>>(`${this.BASE}/${id}`, req);
  }

  assign(id: string, req: AssignAssetRequest): Observable<ApiResponse<AssetResponse>> {
    return this.http.patch<ApiResponse<AssetResponse>>(`${this.BASE}/${id}/assign`, req);
  }

  unassign(id: string, note?: string): Observable<ApiResponse<AssetResponse>> {
    let params = new HttpParams();
    if (note) params = params.set('note', note);
    return this.http.patch<ApiResponse<AssetResponse>>(`${this.BASE}/${id}/unassign`, {}, { params });
  }

  changeStatus(id: string, status: string, note?: string): Observable<ApiResponse<AssetResponse>> {
    let params = new HttpParams().set('status', status);
    if (note) params = params.set('note', note);
    return this.http.patch<ApiResponse<AssetResponse>>(`${this.BASE}/${id}/status`, {}, { params });
  }

  deleteAsset(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE}/${id}`);
  }

  getHistory(id: string): Observable<ApiResponse<AssetHistoryResponse[]>> {
    return this.http.get<ApiResponse<AssetHistoryResponse[]>>(`${this.BASE}/${id}/history`);
  }

  getStats(): Observable<ApiResponse<AssetStats>> {
    return this.http.get<ApiResponse<AssetStats>>(`${this.BASE}/stats`);
  }
}
