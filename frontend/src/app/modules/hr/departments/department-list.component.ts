import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HrService } from '@core/services/hr.service';
import { DepartmentResponse } from '@shared/models/hr.model';
import { DepartmentFormDialogComponent } from './department-form-dialog.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="dept-management">
      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search departments</mat-label>
          <input matInput [(ngModel)]="search" (keyup.enter)="load()" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="openCreate()">
          <mat-icon>add</mat-icon> Add Department
        </button>
      </div>

      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let d">
              <div style="font-weight:500">{{ d.name }}</div>
              <div style="font-size:12px;color:#666">{{ d.description }}</div>
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let d">
              <span class="chip" [class.active]="d.isActive" [class.inactive]="!d.isActive">
                {{ d.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let d">
              <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="openEdit(d)"><mat-icon>edit</mat-icon> Edit</button>
                <button mat-menu-item (click)="deleteDept(d)"><mat-icon>delete</mat-icon> Delete</button>
              </mat-menu>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="['name','status','actions']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['name','status','actions'];"></tr>
        </table>
        <mat-paginator [length]="total" [pageSize]="20" (page)="onPage($event)" showFirstLastButtons></mat-paginator>
      }
    </div>
  `,
  styles: [`
    .dept-management { padding: 24px; }
    .toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
    .search-field { flex: 1; min-width: 250px; }
    table { width: 100%; }
    .chip { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .chip.active { background: #e8f5e9; color: #2e7d32; }
    .chip.inactive { background: #ffebee; color: #c62828; }
    .loading { display: flex; justify-content: center; padding: 48px; }
  `],
})
export class DepartmentListComponent implements OnInit {
  dataSource = new MatTableDataSource<DepartmentResponse>([]);
  loading = signal(true);
  search = '';
  total = 0;
  page = 0;

  constructor(private hrService: HrService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load(): void {
    this.loading.set(true);
    this.hrService.getDepartments(this.page, 20, this.search || undefined).subscribe({
      next: res => { this.dataSource.data = res.data.content; this.total = res.data.totalElements; this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Failed to load', 'Close', { duration: 3000 }); },
    });
  }

  onPage(e: PageEvent) { this.page = e.pageIndex; this.load(); }

  openCreate(): void {
    const ref = this.dialog.open(DepartmentFormDialogComponent, { width: '450px', data: { mode: 'create' } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.snackBar.open('Department created', 'Close', { duration: 3000 }); } });
  }

  openEdit(dept: DepartmentResponse): void {
    const ref = this.dialog.open(DepartmentFormDialogComponent, { width: '450px', data: { mode: 'edit', department: dept } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.snackBar.open('Department updated', 'Close', { duration: 3000 }); } });
  }

  deleteDept(dept: DepartmentResponse): void {
    if (confirm(`Delete ${dept.name}?`)) {
      this.hrService.deleteDepartment(dept.id).subscribe({
        next: () => { this.load(); this.snackBar.open('Deleted', 'Close', { duration: 3000 }); },
        error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
      });
    }
  }
}
