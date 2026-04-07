import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { FinanceService } from '@core/services/finance.service';
import { ExpenseResponse, ExpenseStats, ExpenseCategoryResponse } from '@shared/models/finance.model';
import { ExpenseFormDialogComponent } from './expense-form-dialog.component';
import { ExpenseReviewDialogComponent } from './expense-review-dialog.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatCardModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <div class="expense-page">
      @if (stats()) {
        <div class="stats-row">
          <mat-card class="stat-card"><div class="stat-value">{{ stats()!.totalExpenses }}</div><div class="stat-label">Total</div></mat-card>
          <mat-card class="stat-card pending"><div class="stat-value">{{ stats()!.pendingCount }}</div><div class="stat-label">Pending</div></mat-card>
          <mat-card class="stat-card approved"><div class="stat-value">{{ stats()!.approvedCount }}</div><div class="stat-label">Approved</div></mat-card>
          <mat-card class="stat-card approved"><div class="stat-value">{{ stats()!.totalApprovedAmount | number:'1.2-2' }}</div><div class="stat-label">Approved Amount</div></mat-card>
          <mat-card class="stat-card pending"><div class="stat-value">{{ stats()!.totalPendingAmount | number:'1.2-2' }}</div><div class="stat-label">Pending Amount</div></mat-card>
        </div>
      }
      <div class="toolbar">
        <mat-form-field appearance="outline" class="filter-field"><mat-label>Category</mat-label>
          <mat-select [(ngModel)]="categoryFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            @for (c of categories(); track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
          </mat-select></mat-form-field>
        <mat-form-field appearance="outline" class="filter-field"><mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="PENDING">Pending</mat-option><mat-option value="APPROVED">Approved</mat-option>
            <mat-option value="REJECTED">Rejected</mat-option>
          </mat-select></mat-form-field>
        <mat-form-field appearance="outline" class="filter-field"><mat-label>Date from</mat-label>
          <input matInput [matDatepicker]="fp" [(ngModel)]="dateFrom" (dateChange)="load()" />
          <mat-datepicker-toggle matSuffix [for]="fp"></mat-datepicker-toggle><mat-datepicker #fp></mat-datepicker></mat-form-field>
        <mat-form-field appearance="outline" class="filter-field"><mat-label>Date to</mat-label>
          <input matInput [matDatepicker]="tp" [(ngModel)]="dateTo" (dateChange)="load()" />
          <mat-datepicker-toggle matSuffix [for]="tp"></mat-datepicker-toggle><mat-datepicker #tp></mat-datepicker></mat-form-field>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="openSubmit()"><mat-icon>add</mat-icon> Submit Expense</button>
      </div>
      @if (loading()) { <div class="loading"><mat-spinner diameter="40"></mat-spinner></div> }
      @else {
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="number"><th mat-header-cell *matHeaderCellDef>Expense #</th>
            <td mat-cell *matCellDef="let e">{{ e.expenseNumber }}</td></ng-container>
          <ng-container matColumnDef="employee"><th mat-header-cell *matHeaderCellDef>Employee</th>
            <td mat-cell *matCellDef="let e"><div class="emp-name">{{ e.employeeName }}</div><div class="emp-sub">{{ e.employeeCode }}</div></td></ng-container>
          <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let e">{{ e.categoryName }}</td></ng-container>
          <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let e"><strong>{{ e.amount | number:'1.2-2' }}</strong></td></ng-container>
          <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let e">{{ e.expenseDate | date:'mediumDate' }}</td></ng-container>
          <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let e"><span class="status-chip" [class]="'status-' + e.status.toLowerCase()">{{ e.status }}</span></td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let e">
              <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
              <mat-menu #menu="matMenu">
                @if (e.status === 'PENDING') {
                  <button mat-menu-item (click)="openReview(e, 'APPROVED')"><mat-icon>check_circle</mat-icon> Approve</button>
                  <button mat-menu-item (click)="openReview(e, 'REJECTED')"><mat-icon>cancel</mat-icon> Reject</button>
                  <button mat-menu-item (click)="cancel(e)"><mat-icon>undo</mat-icon> Cancel</button>
                }
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
    .expense-page{padding:24px}
    .stats-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:24px}
    .stat-card{text-align:center;padding:14px}.stat-value{font-size:24px;font-weight:500}.stat-label{font-size:12px;color:#666;margin-top:2px}
    .stat-card.pending .stat-value{color:#ff9800}.stat-card.approved .stat-value{color:#4caf50}
    .toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
    .filter-field{width:160px}.spacer{flex:1}
    table{width:100%}.emp-name{font-weight:500}.emp-sub{font-size:12px;color:#666}
    .status-chip{padding:4px 10px;border-radius:12px;font-size:12px;font-weight:500}
    .status-pending{background:#fff3e0;color:#e65100}.status-approved{background:#e8f5e9;color:#2e7d32}
    .status-rejected{background:#ffebee;color:#c62828}.status-cancelled{background:#f5f5f5;color:#757575}
    .loading{display:flex;justify-content:center;padding:48px}
  `],
})
export class ExpenseListComponent implements OnInit {
  cols = ['number', 'employee', 'category', 'amount', 'date', 'status', 'actions'];
  dataSource = new MatTableDataSource<ExpenseResponse>([]);
  stats = signal<ExpenseStats | null>(null);
  categories = signal<ExpenseCategoryResponse[]>([]);
  loading = signal(true);
  categoryFilter: string | null = null; statusFilter: string | null = null;
  dateFrom: Date | null = null; dateTo: Date | null = null;
  total = 0; pageSize = 20; page = 0;

  constructor(private financeService: FinanceService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); this.loadStats(); this.financeService.getCategories().subscribe({ next: r => this.categories.set(r.data) }); }

  load(): void {
    this.loading.set(true);
    const df = this.dateFrom ? this.dateFrom.toISOString().split('T')[0] : undefined;
    const dt = this.dateTo ? this.dateTo.toISOString().split('T')[0] : undefined;
    this.financeService.getExpenses(this.page, this.pageSize, undefined, this.categoryFilter || undefined,
      this.statusFilter || undefined, df, dt
    ).subscribe({
      next: r => { this.dataSource.data = r.data.content; this.total = r.data.totalElements; this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Failed', 'Close', { duration: 3000 }); },
    });
  }

  loadStats() { this.financeService.getStats().subscribe({ next: r => this.stats.set(r.data) }); }
  onPage(e: PageEvent) { this.page = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  openSubmit() {
    const ref = this.dialog.open(ExpenseFormDialogComponent, { width: '550px' });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadStats(); this.snackBar.open('Expense submitted', 'Close', { duration: 3000 }); } });
  }

  openReview(expense: ExpenseResponse, action: 'APPROVED' | 'REJECTED') {
    const ref = this.dialog.open(ExpenseReviewDialogComponent, { width: '450px', data: { expense, action } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadStats(); this.snackBar.open(`Expense ${action.toLowerCase()}`, 'Close', { duration: 3000 }); } });
  }

  cancel(expense: ExpenseResponse) {
    if (confirm(`Cancel expense ${expense.expenseNumber}?`)) {
      this.financeService.cancelExpense(expense.id).subscribe({
        next: () => { this.load(); this.loadStats(); this.snackBar.open('Cancelled', 'Close', { duration: 3000 }); },
        error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
      });
    }
  }
}
