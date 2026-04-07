import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@shared/models/auth.model';
import { PageResponse } from '@shared/models/user.model';
import {
  ProjectResponse, ProjectRequest, ProjectStats,
  TaskResponse, TaskRequest, MilestoneResponse, MilestoneRequest,
} from '@shared/models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly BASE = `${environment.apiUrl}/v1/projects`;
  constructor(private http: HttpClient) {}

  getProjects(page = 0, size = 20, search?: string, status?: string, priority?: string): Observable<ApiResponse<PageResponse<ProjectResponse>>> {
    let p = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    if (search) p = p.set('search', search);
    if (status) p = p.set('status', status);
    if (priority) p = p.set('priority', priority);
    return this.http.get<ApiResponse<PageResponse<ProjectResponse>>>(this.BASE, { params: p });
  }
  getProject(id: string): Observable<ApiResponse<ProjectResponse>> {
    return this.http.get<ApiResponse<ProjectResponse>>(`${this.BASE}/${id}`);
  }
  createProject(req: ProjectRequest): Observable<ApiResponse<ProjectResponse>> {
    return this.http.post<ApiResponse<ProjectResponse>>(this.BASE, req);
  }
  updateProject(id: string, req: ProjectRequest): Observable<ApiResponse<ProjectResponse>> {
    return this.http.put<ApiResponse<ProjectResponse>>(`${this.BASE}/${id}`, req);
  }
  deleteProject(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE}/${id}`);
  }
  getStats(): Observable<ApiResponse<ProjectStats>> {
    return this.http.get<ApiResponse<ProjectStats>>(`${this.BASE}/stats`);
  }

  // Tasks
  getTasks(projectId: string, page = 0, size = 20, status?: string, assigneeId?: string): Observable<ApiResponse<PageResponse<TaskResponse>>> {
    let p = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    if (status) p = p.set('status', status);
    if (assigneeId) p = p.set('assigneeId', assigneeId);
    return this.http.get<ApiResponse<PageResponse<TaskResponse>>>(`${this.BASE}/tasks/${projectId}`, { params: p });
  }
  createTask(req: TaskRequest): Observable<ApiResponse<TaskResponse>> {
    return this.http.post<ApiResponse<TaskResponse>>(`${this.BASE}/tasks`, req);
  }
  updateTask(id: string, req: TaskRequest): Observable<ApiResponse<TaskResponse>> {
    return this.http.put<ApiResponse<TaskResponse>>(`${this.BASE}/tasks/${id}`, req);
  }
  deleteTask(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE}/tasks/${id}`);
  }

  // Milestones
  getMilestones(projectId: string): Observable<ApiResponse<MilestoneResponse[]>> {
    return this.http.get<ApiResponse<MilestoneResponse[]>>(`${this.BASE}/milestones/${projectId}`);
  }
  createMilestone(req: MilestoneRequest): Observable<ApiResponse<MilestoneResponse>> {
    return this.http.post<ApiResponse<MilestoneResponse>>(`${this.BASE}/milestones`, req);
  }
  toggleMilestone(id: string): Observable<ApiResponse<MilestoneResponse>> {
    return this.http.patch<ApiResponse<MilestoneResponse>>(`${this.BASE}/milestones/${id}/toggle`, {});
  }
  deleteMilestone(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE}/milestones/${id}`);
  }
}
