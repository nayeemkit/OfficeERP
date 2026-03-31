import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '@core/services/user.service';
import { UserResponse, UserStats } from '@shared/models/user.model';
import { UserFormDialogComponent } from './user-form-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="user-management">
      <!-- Stats Cards -->
      @if (stats()) {
        <div class="stats-row">
          <mat-card class="stat-card">
            <div class="stat-value">{{ stats()!.totalUsers }}</div>
            <div class="stat-label">Total users</div>
          </mat-card>
          <mat-card class="stat-card active">
            <div class="stat-value">{{ stats()!.activeUsers }}</div>
            <div class="stat-label">Active</div>
          </mat-card>
          <mat-card class="stat-card inactive">
            <div class="stat-value">{{ stats()!.inactiveUsers }}</div>
            <div class="stat-label">Inactive</div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-value">{{ stats()!.adminCount }} / {{ stats()!.managerCount }} / {{ stats()!.employeeCount }}</div>
            <div class="stat-label">Admin / Manager / Employee</div>
          </mat-card>
        </div>
      }

      <!-- Toolbar -->
      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search users</mat-label>
          <input matInput [(ngModel)]="search" (keyup.enter)="loadUsers()" placeholder="Name or email..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Role</mat-label>
          <mat-select [(ngModel)]="roleFilter" (selectionChange)="loadUsers()">
            <mat-option [value]="null">All roles</mat-option>
            <mat-option value="ADMIN">Admin</mat-option>
            <mat-option value="MANAGER">Manager</mat-option>
            <mat-option value="EMPLOYEE">Employee</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="activeFilter" (selectionChange)="loadUsers()">
            <mat-option [value]="null">All</mat-option>
            <mat-option [value]="true">Active</mat-option>
            <mat-option [value]="false">Inactive</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>person_add</mat-icon> Add User
        </button>
      </div>

      <!-- Table -->
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header="firstName">Name</th>
              <td mat-cell *matCellDef="let user">
                <div class="user-name">{{ user.fullName }}</div>
                <div class="user-email">{{ user.email }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef mat-sort-header="role">Role</th>
              <td mat-cell *matCellDef="let user">
                <span class="role-chip" [class]="'role-' + user.role.toLowerCase()">
                  {{ user.role }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">
                <span class="status-chip" [class.active]="user.isActive" [class.inactive]="!user.isActive">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header="createdAt">Created</th>
              <td mat-cell *matCellDef="let user">{{ user.createdAt | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="openEditDialog(user)">
                    <mat-icon>edit</mat-icon> Edit
                  </button>
                  @if (user.isActive) {
                    <button mat-menu-item (click)="toggleStatus(user)">
                      <mat-icon>block</mat-icon> Deactivate
                    </button>
                  } @else {
                    <button mat-menu-item (click)="toggleStatus(user)">
                      <mat-icon>check_circle</mat-icon> Activate
                    </button>
                  }
                  <button mat-menu-item (click)="deleteUser(user)" class="delete-action">
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
    .user-management { padding: 24px; }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card { text-align: center; padding: 16px; }
    .stat-value { font-size: 28px; font-weight: 500; }
    .stat-label { font-size: 13px; color: #666; margin-top: 4px; }
    .stat-card.active .stat-value { color: #4caf50; }
    .stat-card.inactive .stat-value { color: #f44336; }

    .toolbar {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .search-field { flex: 1; min-width: 250px; }
    .filter-field { width: 150px; }

    .table-container { overflow-x: auto; }
    table { width: 100%; }
    .user-name { font-weight: 500; }
    .user-email { font-size: 12px; color: #666; }

    .role-chip {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .role-admin { background: #e3f2fd; color: #1565c0; }
    .role-manager { background: #fff3e0; color: #e65100; }
    .role-employee { background: #e8f5e9; color: #2e7d32; }

    .status-chip {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-chip.active { background: #e8f5e9; color: #2e7d32; }
    .status-chip.inactive { background: #ffebee; color: #c62828; }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .delete-action { color: #f44336; }
  `],
})
export class UserListComponent implements OnInit {
  displayedColumns = ['name', 'role', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<UserResponse>([]);
  stats = signal<UserStats | null>(null);
  loading = signal(true);

  search = '';
  roleFilter: string | null = null;
  activeFilter: boolean | null = null;
  pageSize = 20;
  totalElements = 0;
  currentPage = 0;
  currentSort = 'createdAt,desc';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers(
      this.currentPage,
      this.pageSize,
      this.search || undefined,
      this.roleFilter || undefined,
      this.activeFilter ?? undefined,
      this.currentSort,
    ).subscribe({
      next: (res) => {
        this.dataSource.data = res.data.content;
        this.totalElements = res.data.totalElements;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
      },
    });
  }

  loadStats(): void {
    this.userService.getUserStats().subscribe({
      next: (res) => this.stats.set(res.data),
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSortChange(sort: Sort): void {
    this.currentSort = sort.active + ',' + sort.direction;
    this.loadUsers();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.loadStats();
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openEditDialog(user: UserResponse): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit', user },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
        this.loadStats();
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  toggleStatus(user: UserResponse): void {
    const action = user.isActive
      ? this.userService.deactivateUser(user.id)
      : this.userService.activateUser(user.id);

    action.subscribe({
      next: () => {
        this.loadUsers();
        this.loadStats();
        this.snackBar.open(
          `User ${user.isActive ? 'deactivated' : 'activated'}`,
          'Close',
          { duration: 3000 },
        );
      },
      error: () => this.snackBar.open('Action failed', 'Close', { duration: 3000 }),
    });
  }

  deleteUser(user: UserResponse): void {
    if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStats();
          this.snackBar.open('User deleted', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 }),
      });
    }
  }
}
