import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@shared/models/auth.model';
import {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats,
  PageResponse,
} from '@shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${environment.apiUrl}/v1/users`;

  constructor(private http: HttpClient) {}

  getUsers(
    page = 0,
    size = 20,
    search?: string,
    role?: string,
    isActive?: boolean,
    sort = 'createdAt,desc',
  ): Observable<ApiResponse<PageResponse<UserResponse>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    if (isActive !== undefined && isActive !== null) {
      params = params.set('isActive', isActive.toString());
    }

    return this.http.get<ApiResponse<PageResponse<UserResponse>>>(this.API, { params });
  }

  getUserById(id: string): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.API}/${id}`);
  }

  createUser(request: CreateUserRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(this.API, request);
  }

  updateUser(id: string, request: UpdateUserRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.API}/${id}`, request);
  }

  deactivateUser(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API}/${id}/deactivate`, {});
  }

  activateUser(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API}/${id}/activate`, {});
  }

  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`);
  }

  getUserStats(): Observable<ApiResponse<UserStats>> {
    return this.http.get<ApiResponse<UserStats>>(`${this.API}/stats`);
  }
}
