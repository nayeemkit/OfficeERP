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
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AttendanceService } from '@core/services/attendance.service';
import { HrService } from '@core/services/hr.service';
import { AttendanceResponse, DailyStats } from '@shared/models/attendance.model';
import { DepartmentResponse, EmployeeResponse } from '@shared/models/hr.model';
import { AttendanceCheckDialogComponent } from './attendance-check-dialog.component';
import { AttendanceManualDialogComponent } from './attendance-manual-dialog.component';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatCardModule, MatDialogModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <div class="attendance-page">
      @if (dailyStats()) {
        <div class="stats-row">
          <mat-card class="stat-card">
            <div class="stat-value">{{ dailyStats()!.totalCheckedIn }}</div>
            <div class="stat-label">Checked in today</div>
          </mat-card>
          <mat-card class="stat-card present">
            <div class="stat-value">{{ dailyStats()!.present }}</div>
            <div class="stat-label">Present</div>
          </mat-card>
          <mat-card class="stat-card late">
            <div class="stat-value">{{ dailyStats()!.late }}</div>
            <div class="stat-label">Late</div>
          </mat-card>
          <mat-card class="stat-card absent">
            <div class="stat-value">{{ dailyStats()!.absent }}</div>
            <div class="stat-label">Absent</div>
          </mat-card>
          <mat-card class="stat-card leave">
            <div class="stat-value">{{ dailyStats()!.onLeave }}</div>
            <div class="stat-label">On leave</div>
          </mat-card>
        </div>
      }

      <div class="toolbar">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Department</mat-label>
          <mat-select [(ngModel)]="deptFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            @for (d of departments(); track d.id) {
              <mat-option [value]="d.id">{{ d.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="PRESENT">Present</mat-option>
            <mat-option value="LATE">Late</mat-option>
            <mat-option value="ABSENT">Absent</mat-option>
            <mat-option value="HALF_DAY">Half Day</mat-option>
            <mat-option value="ON_LEAVE">On Leave</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Date from</mat-label>
          <input matInput [matDatepicker]="fromPicker" [(ngModel)]="dateFrom" (dateChange)="load()" />
          <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
          <mat-datepicker #fromPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Date to</mat-label>
          <input matInput [matDatepicker]="toPicker" [(ngModel)]="dateTo" (dateChange)="load()" />
          <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
          <mat-datepicker #toPicker></mat-datepicker>
        </mat-form-field>

        <span class="spacer"></span>

        <button mat-raised-button color="primary" (click)="openCheckDialog('in')">
          <mat-icon>login</mat-icon> Check In
        </button>
        <button mat-raised-button color="accent" (click)="openCheckDialog('out')">
          <mat-icon>logout</mat-icon> Check Out
        </button>
        <button mat-stroked-button (click)="openManualDialog()">
          <mat-icon>edit_calendar</mat-icon> Manual Entry
        </button>
      </div>

      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="employee">
            <th mat-header-cell *matHeaderCellDef>Employee</th>
            <td mat-cell *matCellDef="let a">
              <div class="emp-name">{{ a.employeeName }}</div>
              <div class="emp-sub">{{ a.employeeCode }} · {{ a.departmentName }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let a">{{ a.date | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="checkIn">
            <th mat-header-cell *matHeaderCellDef>Check In</th>
            <td mat-cell *matCellDef="let a">{{ a.checkIn ? (a.checkIn | date:'shortTime') : '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="checkOut">
            <th mat-header-cell *matHeaderCellDef>Check Out</th>
            <td mat-cell *matCellDef="let a">{{ a.checkOut ? (a.checkOut | date:'shortTime') : '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="workHours">
            <th mat-header-cell *matHeaderCellDef>Hours</th>
            <td mat-cell *matCellDef="let a">{{ a.workHours || '-' }}h</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let a">
              <span class="status-chip" [class]="'status-' + a.status.toLowerCase()">
                {{ a.status | titlecase }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="remarks">
            <th mat-header-cell *matHeaderCellDef>Remarks</th>
            <td mat-cell *matCellDef="let a">{{ a.remarks || '-' }}</td>
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
    .attendance-page { padding: 24px; }
    .stats-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .stat-card { text-align: center; padding: 14px; }
    .stat-value { font-size: 26px; font-weight: 500; }
    .stat-label { font-size: 12px; color: #666; margin-top: 2px; }
    .stat-card.present .stat-value { color: #4caf50; }
    .stat-card.late .stat-value { color: #ff9800; }
    .stat-card.absent .stat-value { color: #f44336; }
    .stat-card.leave .stat-value { color: #2196f3; }
    .toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
    .filter-field { width: 150px; }
    .spacer { flex: 1; }
    table { width: 100%; }
    .emp-name { font-weight: 500; }
    .emp-sub { font-size: 12px; color: #666; }
    .status-chip { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-present { background: #e8f5e9; color: #2e7d32; }
    .status-late { background: #fff3e0; color: #e65100; }
    .status-absent { background: #ffebee; color: #c62828; }
    .status-half_day { background: #e3f2fd; color: #1565c0; }
    .status-on_leave { background: #f3e5f5; color: #7b1fa2; }
    .loading { display: flex; justify-content: center; padding: 48px; }
  `],
})
export class AttendanceListComponent implements OnInit {
  displayedColumns = ['employee', 'date', 'checkIn', 'checkOut', 'workHours', 'status', 'remarks'];
  dataSource = new MatTableDataSource<AttendanceResponse>([]);
  dailyStats = signal<DailyStats | null>(null);
  departments = signal<DepartmentResponse[]>([]);
  loading = signal(true);

  deptFilter: string | null = null;
  statusFilter: string | null = null;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  total = 0;
  pageSize = 20;
  page = 0;

  constructor(
    private attendanceService: AttendanceService,
    private hrService: HrService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.load();
    this.loadDailyStats();
    this.hrService.getActiveDepartments().subscribe({ next: res => this.departments.set(res.data) });
  }

  load(): void {
    this.loading.set(true);
    const df = this.dateFrom ? this.formatDate(this.dateFrom) : undefined;
    const dt = this.dateTo ? this.formatDate(this.dateTo) : undefined;

    this.attendanceService.getAll(this.page, this.pageSize, undefined,
      this.deptFilter || undefined, this.statusFilter || undefined, df, dt
    ).subscribe({
      next: res => { this.dataSource.data = res.data.content; this.total = res.data.totalElements; this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Failed to load', 'Close', { duration: 3000 }); },
    });
  }

  loadDailyStats(): void {
    this.attendanceService.getDailyStats().subscribe({ next: res => this.dailyStats.set(res.data) });
  }

  onPage(e: PageEvent) { this.page = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  openCheckDialog(type: 'in' | 'out'): void {
    const ref = this.dialog.open(AttendanceCheckDialogComponent, { width: '450px', data: { type } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadDailyStats(); this.snackBar.open(type === 'in' ? 'Checked in' : 'Checked out', 'Close', { duration: 3000 }); } });
  }

  openManualDialog(): void {
    const ref = this.dialog.open(AttendanceManualDialogComponent, { width: '550px' });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadDailyStats(); this.snackBar.open('Attendance marked', 'Close', { duration: 3000 }); } });
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
