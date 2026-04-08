import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@shared/models/auth.model';
import { DashboardKPI } from '@shared/models/reports.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly BASE = `${environment.apiUrl}/v1/reports`;
  constructor(private http: HttpClient) {}

  getDashboardKPI(): Observable<ApiResponse<DashboardKPI>> {
    return this.http.get<ApiResponse<DashboardKPI>>(`${this.BASE}/dashboard`);
  }
}
