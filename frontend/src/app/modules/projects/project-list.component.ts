import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProjectService } from '@core/services/project.service';
import { ProjectResponse, ProjectStats } from '@shared/models/project.model';
import { ProjectFormDialogComponent } from './project-form-dialog.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatCardModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule,
  ],
  template: `
    <div class="page">
      @if (stats()) {
        <div class="stats-row">
          <mat-card class="stat-card"><div class="stat-value">{{ stats()!.totalProjects }}</div><div class="stat-label">Total</div></mat-card>
          <mat-card class="stat-card planning"><div class="stat-value">{{ stats()!.planning }}</div><div class="stat-label">Planning</div></mat-card>
          <mat-card class="stat-card progress"><div class="stat-value">{{ stats()!.inProgress }}</div><div class="stat-label">In Progress</div></mat-card>
          <mat-card class="stat-card completed"><div class="stat-value">{{ stats()!.completed }}</div><div class="stat-label">Completed</div></mat-card>
          <mat-card class="stat-card hold"><div class="stat-value">{{ stats()!.onHold }}</div><div class="stat-label">On Hold</div></mat-card>
        </div>
      }
      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-field"><mat-label>Search</mat-label>
          <input matInput [(ngModel)]="search" (keyup.enter)="load()" /><mat-icon matSuffix>search</mat-icon></mat-form-field>
        <mat-form-field appearance="outline" class="filter-field"><mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="PLANNING">Planning</mat-option><mat-option value="IN_PROGRESS">In Progress</mat-option>
            <mat-option value="COMPLETED">Completed</mat-option><mat-option value="ON_HOLD">On Hold</mat-option>
          </mat-select></mat-form-field>
        <mat-form-field appearance="outline" class="filter-field"><mat-label>Priority</mat-label>
          <mat-select [(ngModel)]="priorityFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="LOW">Low</mat-option><mat-option value="MEDIUM">Medium</mat-option>
            <mat-option value="HIGH">High</mat-option><mat-option value="CRITICAL">Critical</mat-option>
          </mat-select></mat-form-field>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="openCreate()"><mat-icon>add</mat-icon> New Project</button>
      </div>
      @if (loading()) { <div class="loading"><mat-spinner diameter="40"></mat-spinner></div> }
      @else {
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Project</th>
            <td mat-cell *matCellDef="let p"><div class="emp-name clickable" (click)="viewProject(p)">{{ p.name }}</div>
              <div class="emp-sub">{{ p.ownerName || 'No owner' }}</div></td></ng-container>
          <ng-container matColumnDef="priority"><th mat-header-cell *matHeaderCellDef>Priority</th>
            <td mat-cell *matCellDef="let p"><span class="priority-chip" [class]="'pri-' + p.priority.toLowerCase()">{{ p.priority }}</span></td></ng-container>
          <ng-container matColumnDef="progress"><th mat-header-cell *matHeaderCellDef>Progress</th>
            <td mat-cell *matCellDef="let p">
              <div class="progress-bar"><mat-progress-bar mode="determinate" [value]="p.progress"></mat-progress-bar><span>{{ p.progress }}%</span></div>
            </td></ng-container>
          <ng-container matColumnDef="tasks"><th mat-header-cell *matHeaderCellDef>Tasks</th>
            <td mat-cell *matCellDef="let p">{{ p.completedTasks }}/{{ p.taskCount }}</td></ng-container>
          <ng-container matColumnDef="dates"><th mat-header-cell *matHeaderCellDef>Dates</th>
            <td mat-cell *matCellDef="let p">
              @if (p.startDate) { {{ p.startDate | date:'mediumDate' }} } @else { - }
              <br/><span class="emp-sub">@if (p.endDate) { Due: {{ p.endDate | date:'mediumDate' }} }</span>
            </td></ng-container>
          <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let p"><span class="status-chip" [class]="'status-' + p.status.toLowerCase()">{{ p.status.replace('_',' ') | titlecase }}</span></td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="viewProject(p)"><mat-icon>visibility</mat-icon> View Details</button>
                <button mat-menu-item (click)="openEdit(p)"><mat-icon>edit</mat-icon> Edit</button>
                <button mat-menu-item (click)="deleteProject(p)"><mat-icon>delete</mat-icon> Delete</button>
              </mat-menu>
            </td></ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        <mat-paginator [length]="total" [pageSize]="pageSize" [pageSizeOptions]="[10,20,50]" (page)="onPage($event)" showFirstLastButtons></mat-paginator>
      }
    </div>
  `,
  styles: [`
    .page{padding:24px}.stats-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:24px}
    .stat-card{text-align:center;padding:14px}.stat-value{font-size:26px;font-weight:500}.stat-label{font-size:12px;color:#666;margin-top:2px}
    .stat-card.planning .stat-value{color:#9e9e9e}.stat-card.progress .stat-value{color:#2196f3}
    .stat-card.completed .stat-value{color:#4caf50}.stat-card.hold .stat-value{color:#ff9800}
    .toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
    .search-field{flex:1;min-width:200px}.filter-field{width:150px}.spacer{flex:1}
    table{width:100%}.emp-name{font-weight:500}.emp-sub{font-size:12px;color:#666}.clickable{cursor:pointer;color:#1565c0}
    .priority-chip{padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600}
    .pri-low{background:#e8f5e9;color:#2e7d32}.pri-medium{background:#e3f2fd;color:#1565c0}
    .pri-high{background:#fff3e0;color:#e65100}.pri-critical{background:#ffebee;color:#c62828}
    .status-chip{padding:4px 10px;border-radius:12px;font-size:12px;font-weight:500}
    .status-planning{background:#f5f5f5;color:#757575}.status-in_progress{background:#e3f2fd;color:#1565c0}
    .status-completed{background:#e8f5e9;color:#2e7d32}.status-on_hold{background:#fff3e0;color:#e65100}
    .status-cancelled{background:#ffebee;color:#c62828}
    .progress-bar{display:flex;align-items:center;gap:8px}
    .progress-bar mat-progress-bar{flex:1;max-width:100px}.progress-bar span{font-size:12px;min-width:35px}
    .loading{display:flex;justify-content:center;padding:48px}
  `],
})
export class ProjectListComponent implements OnInit {
  cols = ['name', 'priority', 'progress', 'tasks', 'dates', 'status', 'actions'];
  dataSource = new MatTableDataSource<ProjectResponse>([]);
  stats = signal<ProjectStats | null>(null); loading = signal(true);
  search = ''; statusFilter: string | null = null; priorityFilter: string | null = null;
  total = 0; pageSize = 20; page = 0;

  constructor(private projectService: ProjectService, private dialog: MatDialog, private snackBar: MatSnackBar, private router: Router) {}

  ngOnInit() { this.load(); this.loadStats(); }
  load(): void {
    this.loading.set(true);
    this.projectService.getProjects(this.page, this.pageSize, this.search || undefined, this.statusFilter || undefined, this.priorityFilter || undefined).subscribe({
      next: r => { this.dataSource.data = r.data.content; this.total = r.data.totalElements; this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Failed', 'Close', { duration: 3000 }); },
    });
  }
  loadStats() { this.projectService.getStats().subscribe({ next: r => this.stats.set(r.data) }); }
  onPage(e: PageEvent) { this.page = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  viewProject(p: ProjectResponse) { this.router.navigate(['/projects', p.id]); }

  openCreate() {
    const ref = this.dialog.open(ProjectFormDialogComponent, { width: '600px', data: { mode: 'create' } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadStats(); this.snackBar.open('Project created', 'Close', { duration: 3000 }); } });
  }
  openEdit(p: ProjectResponse) {
    const ref = this.dialog.open(ProjectFormDialogComponent, { width: '600px', data: { mode: 'edit', project: p } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.snackBar.open('Updated', 'Close', { duration: 3000 }); } });
  }
  deleteProject(p: ProjectResponse) {
    if (confirm(`Delete ${p.name}?`)) {
      this.projectService.deleteProject(p.id).subscribe({
        next: () => { this.load(); this.loadStats(); this.snackBar.open('Deleted', 'Close', { duration: 3000 }); },
      });
    }
  }
}
