import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { LeaveService } from '@core/services/leave.service';
import { HrService } from '@core/services/hr.service';
import { LeaveRequestResponse, LeaveStats } from '@shared/models/leave.model';
import { DepartmentResponse } from '@shared/models/hr.model';
import { LeaveApplyDialogComponent } from './leave-apply-dialog.component';
import { LeaveReviewDialogComponent } from './leave-review-dialog.component';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatCardModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatChipsModule,
  ],
  template: `
    <div class="leave-management">
      @if (stats()) {
        <div class="stats-row">
          <mat-card class="stat-card">
            <div class="stat-value">{{ stats()!.totalRequests }}</div>
            <div class="stat-label">Total requests</div>
          </mat-card>
          <mat-card class="stat-card pending">
            <div class="stat-value">{{ stats()!.pendingRequests }}</div>
            <div class="stat-label">Pending</div>
          </mat-card>
          <mat-card class="stat-card approved">
            <div class="stat-value">{{ stats()!.approvedRequests }}</div>
            <div class="stat-label">Approved</div>
          </mat-card>
          <mat-card class="stat-card rejected">
            <div class="stat-value">{{ stats()!.rejectedRequests }}</div>
            <div class="stat-label">Rejected</div>
          </mat-card>
        </div>
      }

      <div class="toolbar">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="PENDING">Pending</mat-option>
            <mat-option value="APPROVED">Approved</mat-option>
            <mat-option value="REJECTED">Rejected</mat-option>
            <mat-option value="CANCELLED">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Department</mat-label>
          <mat-select [(ngModel)]="deptFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            @for (dept of departments(); track dept.id) {
              <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <span class="spacer"></span>

        <button mat-raised-button color="primary" (click)="openApplyDialog()">
          <mat-icon>add</mat-icon> Apply Leave
        </button>
      </div>

      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="employee">
            <th mat-header-cell *matHeaderCellDef>Employee</th>
            <td mat-cell *matCellDef="let r">
              <div class="emp-name">{{ r.employeeName }}</div>
              <div class="emp-sub">{{ r.employeeCode }} · {{ r.departmentName }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="leaveType">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let r">{{ r.leaveTypeName }}</td>
          </ng-container>

          <ng-container matColumnDef="dates">
            <th mat-header-cell *matHeaderCellDef>Dates</th>
            <td mat-cell *matCellDef="let r">
              {{ r.startDate | date:'mediumDate' }} — {{ r.endDate | date:'mediumDate' }}
              <div class="emp-sub">{{ r.totalDays }} day(s)</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let r">
              <span class="status-chip" [class]="'status-' + r.status.toLowerCase()">{{ r.status }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let r">
              <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
              <mat-menu #menu="matMenu">
                @if (r.status === 'PENDING') {
                  <button mat-menu-item (click)="openReviewDialog(r, 'APPROVED')">
                    <mat-icon>check_circle</mat-icon> Approve
                  </button>
                  <button mat-menu-item (click)="openReviewDialog(r, 'REJECTED')">
                    <mat-icon>cancel</mat-icon> Reject
                  </button>
                  <button mat-menu-item (click)="cancelLeave(r)">
                    <mat-icon>undo</mat-icon> Cancel
                  </button>
                }
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [length]="total" [pageSize]="pageSize" [pageSizeOptions]="[10,20,50]"
          (page)="onPage($event)" showFirstLastButtons></mat-paginator>
      }
    </div>
  `,
  styles: [`
    .leave-management { padding: 24px; }
    .stats-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { text-align: center; padding: 16px; }
    .stat-value { font-size: 28px; font-weight: 500; }
    .stat-label { font-size: 13px; color: #666; margin-top: 4px; }
    .stat-card.pending .stat-value { color: #ff9800; }
    .stat-card.approved .stat-value { color: #4caf50; }
    .stat-card.rejected .stat-value { color: #f44336; }
    .toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
    .filter-field { width: 180px; }
    .spacer { flex: 1; }
    table { width: 100%; }
    .emp-name { font-weight: 500; }
    .emp-sub { font-size: 12px; color: #666; }
    .status-chip { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-pending { background: #fff3e0; color: #e65100; }
    .status-approved { background: #e8f5e9; color: #2e7d32; }
    .status-rejected { background: #ffebee; color: #c62828; }
    .status-cancelled { background: #f5f5f5; color: #757575; }
    .loading { display: flex; justify-content: center; padding: 48px; }
  `],
})
export class LeaveListComponent implements OnInit {
  displayedColumns = ['employee', 'leaveType', 'dates', 'status', 'actions'];
  dataSource = new MatTableDataSource<LeaveRequestResponse>([]);
  stats = signal<LeaveStats | null>(null);
  departments = signal<DepartmentResponse[]>([]);
  loading = signal(true);
  statusFilter: string | null = null;
  deptFilter: string | null = null;
  total = 0;
  pageSize = 20;
  page = 0;

  constructor(
    private leaveService: LeaveService,
    private hrService: HrService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.load();
    this.loadStats();
    this.hrService.getActiveDepartments().subscribe({ next: res => this.departments.set(res.data) });
  }

  load(): void {
    this.loading.set(true);
    this.leaveService.getLeaveRequests(this.page, this.pageSize, undefined,
      this.statusFilter || undefined, this.deptFilter || undefined
    ).subscribe({
      next: res => { this.dataSource.data = res.data.content; this.total = res.data.totalElements; this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Failed to load', 'Close', { duration: 3000 }); },
    });
  }

  loadStats(): void {
    this.leaveService.getStats(this.deptFilter || undefined).subscribe({ next: res => this.stats.set(res.data) });
  }

  onPage(e: PageEvent) { this.page = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  openApplyDialog(): void {
    const ref = this.dialog.open(LeaveApplyDialogComponent, { width: '550px' });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadStats(); this.snackBar.open('Leave applied', 'Close', { duration: 3000 }); } });
  }

  openReviewDialog(request: LeaveRequestResponse, action: 'APPROVED' | 'REJECTED'): void {
    const ref = this.dialog.open(LeaveReviewDialogComponent, { width: '450px', data: { request, action } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadStats(); this.snackBar.open(`Leave ${action.toLowerCase()}`, 'Close', { duration: 3000 }); } });
  }

  cancelLeave(request: LeaveRequestResponse): void {
    if (confirm(`Cancel leave request for ${request.employeeName}?`)) {
      this.leaveService.cancelLeave(request.id).subscribe({
        next: () => { this.load(); this.loadStats(); this.snackBar.open('Leave cancelled', 'Close', { duration: 3000 }); },
        error: () => this.snackBar.open('Failed to cancel', 'Close', { duration: 3000 }),
      });
    }
  }
}
