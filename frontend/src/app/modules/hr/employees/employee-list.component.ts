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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HrService } from '@core/services/hr.service';
import { EmployeeResponse, EmployeeStats, DepartmentResponse, DesignationResponse } from '@shared/models/hr.model';
import { EmployeeFormDialogComponent } from './employee-form-dialog.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatCardModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  template: `
    <div class="employee-management">
      @if (stats()) {
        <div class="stats-row">
          <mat-card class="stat-card">
            <div class="stat-value">{{ stats()!.totalEmployees }}</div>
            <div class="stat-label">Total employees</div>
          </mat-card>
          <mat-card class="stat-card active">
            <div class="stat-value">{{ stats()!.activeEmployees }}</div>
            <div class="stat-label">Active</div>
          </mat-card>
          <mat-card class="stat-card warning">
            <div class="stat-value">{{ stats()!.onLeave }}</div>
            <div class="stat-label">On leave</div>
          </mat-card>
          <mat-card class="stat-card inactive">
            <div class="stat-value">{{ stats()!.resigned }}</div>
            <div class="stat-label">Resigned</div>
          </mat-card>
        </div>
      }

      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search employees</mat-label>
          <input matInput [(ngModel)]="search" (keyup.enter)="loadEmployees()" placeholder="Name, email or code..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Department</mat-label>
          <mat-select [(ngModel)]="deptFilter" (selectionChange)="loadEmployees()">
            <mat-option [value]="null">All</mat-option>
            @for (dept of departments(); track dept.id) {
              <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="loadEmployees()">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="ACTIVE">Active</mat-option>
            <mat-option value="ON_LEAVE">On Leave</mat-option>
            <mat-option value="RESIGNED">Resigned</mat-option>
            <mat-option value="TERMINATED">Terminated</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>person_add</mat-icon> Add Employee
        </button>
      </div>

      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <div class="table-container">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="employeeCode">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let e">{{ e.employeeCode }}</td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let e">
                <div class="emp-name">{{ e.fullName }}</div>
                <div class="emp-email">{{ e.email }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef>Department</th>
              <td mat-cell *matCellDef="let e">{{ e.departmentName }}</td>
            </ng-container>

            <ng-container matColumnDef="designation">
              <th mat-header-cell *matHeaderCellDef>Designation</th>
              <td mat-cell *matCellDef="let e">{{ e.designationTitle || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let e">
                <span class="status-chip" [class]="'status-' + e.status.toLowerCase()">
                  {{ e.status | titlecase }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="joinDate">
              <th mat-header-cell *matHeaderCellDef>Join Date</th>
              <td mat-cell *matCellDef="let e">{{ e.joinDate | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let e">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="openEditDialog(e)">
                    <mat-icon>edit</mat-icon> Edit
                  </button>
                  <button mat-menu-item (click)="deleteEmployee(e)" class="delete-action">
                    <mat-icon>delete</mat-icon> Delete
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    .employee-management { padding: 24px; }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card { text-align: center; padding: 16px; }
    .stat-value { font-size: 28px; font-weight: 500; }
    .stat-label { font-size: 13px; color: #666; margin-top: 4px; }
    .stat-card.active .stat-value { color: #4caf50; }
    .stat-card.warning .stat-value { color: #ff9800; }
    .stat-card.inactive .stat-value { color: #f44336; }
    .toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
    .search-field { flex: 1; min-width: 250px; }
    .filter-field { width: 160px; }
    .table-container { overflow-x: auto; }
    table { width: 100%; }
    .emp-name { font-weight: 500; }
    .emp-email { font-size: 12px; color: #666; }
    .status-chip { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-active { background: #e8f5e9; color: #2e7d32; }
    .status-on_leave { background: #fff3e0; color: #e65100; }
    .status-resigned { background: #fce4ec; color: #c62828; }
    .status-terminated { background: #ffebee; color: #b71c1c; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .delete-action { color: #f44336; }
  `],
})
export class EmployeeListComponent implements OnInit {
  displayedColumns = ['employeeCode', 'name', 'department', 'designation', 'status', 'joinDate', 'actions'];
  dataSource = new MatTableDataSource<EmployeeResponse>([]);
  stats = signal<EmployeeStats | null>(null);
  departments = signal<DepartmentResponse[]>([]);
  loading = signal(true);

  search = '';
  deptFilter: string | null = null;
  statusFilter: string | null = null;
  pageSize = 20;
  totalElements = 0;
  currentPage = 0;

  constructor(
    private hrService: HrService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadStats();
    this.loadDepartments();
  }

  loadEmployees(): void {
    this.loading.set(true);
    this.hrService.getEmployees(
      this.currentPage, this.pageSize,
      this.search || undefined,
      this.deptFilter || undefined,
      this.statusFilter || undefined,
    ).subscribe({
      next: res => {
        this.dataSource.data = res.data.content;
        this.totalElements = res.data.totalElements;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load employees', 'Close', { duration: 3000 });
      },
    });
  }

  loadStats(): void {
    this.hrService.getEmployeeStats().subscribe({ next: res => this.stats.set(res.data) });
  }

  loadDepartments(): void {
    this.hrService.getActiveDepartments().subscribe({ next: res => this.departments.set(res.data) });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEmployees();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(EmployeeFormDialogComponent, {
      width: '650px', data: { mode: 'create' },
    });
    ref.afterClosed().subscribe(result => {
      if (result) { this.loadEmployees(); this.loadStats(); this.snackBar.open('Employee created', 'Close', { duration: 3000 }); }
    });
  }

  openEditDialog(employee: EmployeeResponse): void {
    const ref = this.dialog.open(EmployeeFormDialogComponent, {
      width: '650px', data: { mode: 'edit', employee },
    });
    ref.afterClosed().subscribe(result => {
      if (result) { this.loadEmployees(); this.loadStats(); this.snackBar.open('Employee updated', 'Close', { duration: 3000 }); }
    });
  }

  deleteEmployee(employee: EmployeeResponse): void {
    if (confirm(`Delete ${employee.fullName}?`)) {
      this.hrService.deleteEmployee(employee.id).subscribe({
        next: () => { this.loadEmployees(); this.loadStats(); this.snackBar.open('Employee deleted', 'Close', { duration: 3000 }); },
        error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 }),
      });
    }
  }
}
