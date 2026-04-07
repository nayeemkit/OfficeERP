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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BudgetService } from '@core/services/invoice.service';
import { HrService } from '@core/services/hr.service';
import { BudgetResponse, BudgetStats } from '@shared/models/invoice.model';
import { DepartmentResponse } from '@shared/models/hr.model';
import { BudgetFormDialogComponent } from './budget-form-dialog.component';

@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCardModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule,
  ],
  template: `
    <div class="page">
      @if (stats()) {
        <div class="stats-row">
          <mat-card class="stat-card"><div class="stat-value">{{ stats()!.totalAllocated | number:'1.2-2' }}</div><div class="stat-label">Total Allocated</div></mat-card>
          <mat-card class="stat-card spent"><div class="stat-value">{{ stats()!.totalSpent | number:'1.2-2' }}</div><div class="stat-label">Total Spent</div></mat-card>
          <mat-card class="stat-card remaining"><div class="stat-value">{{ stats()!.totalRemaining | number:'1.2-2' }}</div><div class="stat-label">Remaining</div></mat-card>
          <mat-card class="stat-card"><div class="stat-value">{{ stats()!.overallUtilization | number:'1.1-1' }}%</div><div class="stat-label">Utilization</div></mat-card>
        </div>
      }
      <div class="toolbar">
        <mat-form-field appearance="outline" class="filter-field"><mat-label>Department</mat-label>
          <mat-select [(ngModel)]="deptFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            @for (d of departments(); track d.id) { <mat-option [value]="d.id">{{ d.name }}</mat-option> }
          </mat-select></mat-form-field>
        <mat-form-field appearance="outline" class="filter-field"><mat-label>Year</mat-label>
          <mat-select [(ngModel)]="yearFilter" (selectionChange)="load()">
            @for (y of years; track y) { <mat-option [value]="y">{{ y }}</mat-option> }
          </mat-select></mat-form-field>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="openCreate()"><mat-icon>add</mat-icon> Set Budget</button>
      </div>
      @if (loading()) { <div class="loading"><mat-spinner diameter="40"></mat-spinner></div> }
      @else {
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="department"><th mat-header-cell *matHeaderCellDef>Department</th>
            <td mat-cell *matCellDef="let b">{{ b.departmentName }}</td></ng-container>
          <ng-container matColumnDef="period"><th mat-header-cell *matHeaderCellDef>Period</th>
            <td mat-cell *matCellDef="let b">{{ monthNames[b.month - 1] }} {{ b.year }}</td></ng-container>
          <ng-container matColumnDef="allocated"><th mat-header-cell *matHeaderCellDef>Allocated</th>
            <td mat-cell *matCellDef="let b">{{ b.allocated | number:'1.2-2' }}</td></ng-container>
          <ng-container matColumnDef="spent"><th mat-header-cell *matHeaderCellDef>Spent</th>
            <td mat-cell *matCellDef="let b">{{ b.spent | number:'1.2-2' }}</td></ng-container>
          <ng-container matColumnDef="remaining"><th mat-header-cell *matHeaderCellDef>Remaining</th>
            <td mat-cell *matCellDef="let b" [class.over-budget]="b.remaining < 0">{{ b.remaining | number:'1.2-2' }}</td></ng-container>
          <ng-container matColumnDef="utilization"><th mat-header-cell *matHeaderCellDef>Utilization</th>
            <td mat-cell *matCellDef="let b">
              <div class="util-bar">
                <mat-progress-bar mode="determinate" [value]="b.utilization" [color]="b.utilization > 90 ? 'warn' : 'primary'"></mat-progress-bar>
                <span>{{ b.utilization | number:'1.1-1' }}%</span>
              </div>
            </td></ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        <mat-paginator [length]="total" [pageSize]="pageSize" [pageSizeOptions]="[10,20,50]" (page)="onPage($event)" showFirstLastButtons></mat-paginator>
      }
    </div>
  `,
  styles: [`
    .page{padding:24px}.stats-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:24px}
    .stat-card{text-align:center;padding:14px}.stat-value{font-size:24px;font-weight:500}.stat-label{font-size:12px;color:#666;margin-top:2px}
    .stat-card.spent .stat-value{color:#ff9800}.stat-card.remaining .stat-value{color:#4caf50}
    .toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
    .filter-field{width:160px}.spacer{flex:1}table{width:100%}
    .over-budget{color:#f44336;font-weight:600}
    .util-bar{display:flex;align-items:center;gap:8px}
    .util-bar mat-progress-bar{flex:1;max-width:120px}
    .util-bar span{font-size:12px;min-width:40px}
    .loading{display:flex;justify-content:center;padding:48px}
  `],
})
export class BudgetListComponent implements OnInit {
  cols = ['department', 'period', 'allocated', 'spent', 'remaining', 'utilization'];
  dataSource = new MatTableDataSource<BudgetResponse>([]);
  stats = signal<BudgetStats | null>(null);
  departments = signal<DepartmentResponse[]>([]);
  loading = signal(true);
  deptFilter: string | null = null;
  yearFilter = new Date().getFullYear();
  years = [2024, 2025, 2026, 2027];
  monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  total = 0; pageSize = 20; page = 0;

  constructor(private budgetService: BudgetService, private hrService: HrService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); this.loadStats(); this.hrService.getActiveDepartments().subscribe({ next: r => this.departments.set(r.data) }); }
  load(): void {
    this.loading.set(true);
    this.budgetService.getAll(this.page, this.pageSize, this.deptFilter || undefined, this.yearFilter).subscribe({
      next: r => { this.dataSource.data = r.data.content; this.total = r.data.totalElements; this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Failed', 'Close', { duration: 3000 }); },
    });
  }
  loadStats() { this.budgetService.getStats(this.yearFilter).subscribe({ next: r => this.stats.set(r.data) }); }
  onPage(e: PageEvent) { this.page = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
  openCreate() {
    const ref = this.dialog.open(BudgetFormDialogComponent, { width: '500px' });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadStats(); this.snackBar.open('Budget saved', 'Close', { duration: 3000 }); } });
  }
}
