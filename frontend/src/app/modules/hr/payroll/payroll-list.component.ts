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
import { PayrollService } from '@core/services/payroll.service';
import { PayslipResponse, PayrollStats } from '@shared/models/payroll.model';
import { PayrollGenerateDialogComponent } from './payroll-generate-dialog.component';
import { SalaryStructureDialogComponent } from './salary-structure-dialog.component';

@Component({
  selector: 'app-payroll-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatCardModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="payroll-page">
      @if (stats()) {
        <div class="stats-row">
          <mat-card class="stat-card">
            <div class="stat-value">{{ stats()!.totalPayslips }}</div>
            <div class="stat-label">Total payslips</div>
          </mat-card>
          <mat-card class="stat-card draft">
            <div class="stat-value">{{ stats()!.draftCount }}</div>
            <div class="stat-label">Draft</div>
          </mat-card>
          <mat-card class="stat-card confirmed">
            <div class="stat-value">{{ stats()!.confirmedCount }}</div>
            <div class="stat-label">Confirmed</div>
          </mat-card>
          <mat-card class="stat-card paid">
            <div class="stat-value">{{ stats()!.paidCount }}</div>
            <div class="stat-label">Paid</div>
          </mat-card>
        </div>
      }

      <div class="toolbar">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Year</mat-label>
          <mat-select [(ngModel)]="yearFilter" (selectionChange)="load()">
            @for (y of years; track y) { <mat-option [value]="y">{{ y }}</mat-option> }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Month</mat-label>
          <mat-select [(ngModel)]="monthFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            @for (m of months; track m.value) { <mat-option [value]="m.value">{{ m.label }}</mat-option> }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="DRAFT">Draft</mat-option>
            <mat-option value="CONFIRMED">Confirmed</mat-option>
            <mat-option value="PAID">Paid</mat-option>
          </mat-select>
        </mat-form-field>

        <span class="spacer"></span>

        <button mat-stroked-button (click)="openSalaryDialog()">
          <mat-icon>account_balance_wallet</mat-icon> Salary Structure
        </button>
        <button mat-raised-button color="primary" (click)="openGenerateDialog()">
          <mat-icon>calculate</mat-icon> Generate Payroll
        </button>
      </div>

      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="employee">
            <th mat-header-cell *matHeaderCellDef>Employee</th>
            <td mat-cell *matCellDef="let p">
              <div class="emp-name">{{ p.employeeName }}</div>
              <div class="emp-sub">{{ p.employeeCode }} · {{ p.departmentName }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="period">
            <th mat-header-cell *matHeaderCellDef>Period</th>
            <td mat-cell *matCellDef="let p">{{ monthNames[p.month - 1] }} {{ p.year }}</td>
          </ng-container>

          <ng-container matColumnDef="gross">
            <th mat-header-cell *matHeaderCellDef>Gross</th>
            <td mat-cell *matCellDef="let p">{{ p.grossSalary | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="deductions">
            <th mat-header-cell *matHeaderCellDef>Deductions</th>
            <td mat-cell *matCellDef="let p">{{ p.totalDeductions | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="net">
            <th mat-header-cell *matHeaderCellDef>Net Salary</th>
            <td mat-cell *matCellDef="let p"><strong>{{ p.netSalary | number:'1.2-2' }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="attendance">
            <th mat-header-cell *matHeaderCellDef>Attendance</th>
            <td mat-cell *matCellDef="let p">{{ p.presentDays }}/{{ p.workingDays }} days</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let p">
              <span class="status-chip" [class]="'status-' + p.status.toLowerCase()">{{ p.status }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
              <mat-menu #menu="matMenu">
                @if (p.status === 'DRAFT') {
                  <button mat-menu-item (click)="confirm(p)"><mat-icon>check</mat-icon> Confirm</button>
                }
                @if (p.status === 'CONFIRMED') {
                  <button mat-menu-item (click)="markPaid(p)"><mat-icon>payments</mat-icon> Mark Paid</button>
                }
                <button mat-menu-item (click)="downloadPdf(p)"><mat-icon>picture_as_pdf</mat-icon> Download PDF</button>
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
    .payroll-page { padding: 24px; }
    .stats-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .stat-card { text-align: center; padding: 14px; }
    .stat-value { font-size: 26px; font-weight: 500; }
    .stat-label { font-size: 12px; color: #666; margin-top: 2px; }
    .stat-card.draft .stat-value { color: #ff9800; }
    .stat-card.confirmed .stat-value { color: #2196f3; }
    .stat-card.paid .stat-value { color: #4caf50; }
    .toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
    .filter-field { width: 140px; }
    .spacer { flex: 1; }
    table { width: 100%; }
    .emp-name { font-weight: 500; }
    .emp-sub { font-size: 12px; color: #666; }
    .status-chip { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-draft { background: #fff3e0; color: #e65100; }
    .status-confirmed { background: #e3f2fd; color: #1565c0; }
    .status-paid { background: #e8f5e9; color: #2e7d32; }
    .loading { display: flex; justify-content: center; padding: 48px; }
  `],
})
export class PayrollListComponent implements OnInit {
  displayedColumns = ['employee', 'period', 'gross', 'deductions', 'net', 'attendance', 'status', 'actions'];
  dataSource = new MatTableDataSource<PayslipResponse>([]);
  stats = signal<PayrollStats | null>(null);
  loading = signal(true);

  yearFilter = new Date().getFullYear();
  monthFilter: number | null = null;
  statusFilter: string | null = null;
  total = 0;
  pageSize = 20;
  page = 0;

  years = [2024, 2025, 2026, 2027];
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months = this.monthNames.map((label, i) => ({ value: i + 1, label }));

  constructor(
    private payrollService: PayrollService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); this.loadStats(); }

  load(): void {
    this.loading.set(true);
    this.payrollService.getPayslips(this.page, this.pageSize, undefined,
      this.yearFilter, this.monthFilter ?? undefined, this.statusFilter || undefined
    ).subscribe({
      next: res => { this.dataSource.data = res.data.content; this.total = res.data.totalElements; this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Failed to load', 'Close', { duration: 3000 }); },
    });
  }

  loadStats(): void {
    this.payrollService.getStats(this.yearFilter, this.monthFilter ?? undefined).subscribe({
      next: res => this.stats.set(res.data),
    });
  }

  onPage(e: PageEvent) { this.page = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  openGenerateDialog(): void {
    const ref = this.dialog.open(PayrollGenerateDialogComponent, { width: '450px' });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadStats(); this.snackBar.open('Payroll generated', 'Close', { duration: 3000 }); } });
  }

  openSalaryDialog(): void {
    this.dialog.open(SalaryStructureDialogComponent, { width: '600px' });
  }

  confirm(p: PayslipResponse): void {
    this.payrollService.confirmPayslip(p.id).subscribe({
      next: () => { this.load(); this.loadStats(); this.snackBar.open('Payslip confirmed', 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
    });
  }

  markPaid(p: PayslipResponse): void {
    this.payrollService.markAsPaid(p.id).subscribe({
      next: () => { this.load(); this.loadStats(); this.snackBar.open('Marked as paid', 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
    });
  }

  downloadPdf(p: PayslipResponse): void {
    this.payrollService.downloadPdf(p.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip_${p.employeeCode}_${p.year}_${String(p.month).padStart(2, '0')}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('PDF download failed', 'Close', { duration: 3000 }),
    });
  }
}
