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
import { InvoiceService } from '@core/services/invoice.service';
import { InvoiceResponse, InvoiceStats } from '@shared/models/invoice.model';
import { InvoiceFormDialogComponent } from './invoice-form-dialog.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatCardModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page">
      @if (stats()) {
        <div class="stats-row">
          <mat-card class="stat-card"><div class="stat-value">{{ stats()!.totalInvoices }}</div><div class="stat-label">Total</div></mat-card>
          <mat-card class="stat-card draft"><div class="stat-value">{{ stats()!.draftCount }}</div><div class="stat-label">Draft</div></mat-card>
          <mat-card class="stat-card sent"><div class="stat-value">{{ stats()!.sentCount }}</div><div class="stat-label">Sent</div></mat-card>
          <mat-card class="stat-card paid"><div class="stat-value">{{ stats()!.paidCount }}</div><div class="stat-label">Paid</div></mat-card>
          <mat-card class="stat-card overdue"><div class="stat-value">{{ stats()!.overdueCount }}</div><div class="stat-label">Overdue</div></mat-card>
          <mat-card class="stat-card paid"><div class="stat-value">{{ stats()!.totalPaid | number:'1.2-2' }}</div><div class="stat-label">Total Paid</div></mat-card>
        </div>
      }
      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-field"><mat-label>Search</mat-label>
          <input matInput [(ngModel)]="search" (keyup.enter)="load()" placeholder="Invoice # or client..." /><mat-icon matSuffix>search</mat-icon></mat-form-field>
        <mat-form-field appearance="outline" class="filter-field"><mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="DRAFT">Draft</mat-option><mat-option value="SENT">Sent</mat-option>
            <mat-option value="PAID">Paid</mat-option><mat-option value="OVERDUE">Overdue</mat-option>
          </mat-select></mat-form-field>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="openCreate()"><mat-icon>add</mat-icon> New Invoice</button>
      </div>
      @if (loading()) { <div class="loading"><mat-spinner diameter="40"></mat-spinner></div> }
      @else {
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="number"><th mat-header-cell *matHeaderCellDef>Invoice #</th>
            <td mat-cell *matCellDef="let i">{{ i.invoiceNumber }}</td></ng-container>
          <ng-container matColumnDef="client"><th mat-header-cell *matHeaderCellDef>Client</th>
            <td mat-cell *matCellDef="let i"><div class="emp-name">{{ i.clientName }}</div><div class="emp-sub">{{ i.clientEmail }}</div></td></ng-container>
          <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let i"><strong>{{ i.totalAmount | number:'1.2-2' }}</strong></td></ng-container>
          <ng-container matColumnDef="dates"><th mat-header-cell *matHeaderCellDef>Issue / Due</th>
            <td mat-cell *matCellDef="let i">{{ i.issueDate | date:'mediumDate' }}<br/><span class="emp-sub">Due: {{ i.dueDate | date:'mediumDate' }}</span></td></ng-container>
          <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let i"><span class="status-chip" [class]="'status-' + i.status.toLowerCase()">{{ i.status }}</span></td></ng-container>
          <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let i">
              <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
              <mat-menu #menu="matMenu">
                @if (i.status === 'DRAFT') { <button mat-menu-item (click)="changeStatus(i, 'SENT')"><mat-icon>send</mat-icon> Mark Sent</button> }
                @if (i.status === 'SENT') { <button mat-menu-item (click)="changeStatus(i, 'PAID')"><mat-icon>payments</mat-icon> Mark Paid</button> }
                <button mat-menu-item (click)="openEdit(i)"><mat-icon>edit</mat-icon> Edit</button>
                <button mat-menu-item (click)="deleteInvoice(i)"><mat-icon>delete</mat-icon> Delete</button>
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
    .stat-card{text-align:center;padding:14px}.stat-value{font-size:24px;font-weight:500}.stat-label{font-size:12px;color:#666;margin-top:2px}
    .stat-card.draft .stat-value{color:#9e9e9e}.stat-card.sent .stat-value{color:#2196f3}
    .stat-card.paid .stat-value{color:#4caf50}.stat-card.overdue .stat-value{color:#f44336}
    .toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
    .search-field{flex:1;min-width:200px}.filter-field{width:150px}.spacer{flex:1}
    table{width:100%}.emp-name{font-weight:500}.emp-sub{font-size:12px;color:#666}
    .status-chip{padding:4px 10px;border-radius:12px;font-size:12px;font-weight:500}
    .status-draft{background:#f5f5f5;color:#757575}.status-sent{background:#e3f2fd;color:#1565c0}
    .status-paid{background:#e8f5e9;color:#2e7d32}.status-overdue{background:#ffebee;color:#c62828}
    .status-cancelled{background:#f5f5f5;color:#9e9e9e}
    .loading{display:flex;justify-content:center;padding:48px}
  `],
})
export class InvoiceListComponent implements OnInit {
  cols = ['number', 'client', 'amount', 'dates', 'status', 'actions'];
  dataSource = new MatTableDataSource<InvoiceResponse>([]);
  stats = signal<InvoiceStats | null>(null); loading = signal(true);
  search = ''; statusFilter: string | null = null;
  total = 0; pageSize = 20; page = 0;

  constructor(private invoiceService: InvoiceService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); this.loadStats(); }
  load(): void {
    this.loading.set(true);
    this.invoiceService.getAll(this.page, this.pageSize, this.search || undefined, this.statusFilter || undefined).subscribe({
      next: r => { this.dataSource.data = r.data.content; this.total = r.data.totalElements; this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Failed', 'Close', { duration: 3000 }); },
    });
  }
  loadStats() { this.invoiceService.getStats().subscribe({ next: r => this.stats.set(r.data) }); }
  onPage(e: PageEvent) { this.page = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  openCreate() {
    const ref = this.dialog.open(InvoiceFormDialogComponent, { width: '600px', data: { mode: 'create' } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadStats(); this.snackBar.open('Invoice created', 'Close', { duration: 3000 }); } });
  }
  openEdit(inv: InvoiceResponse) {
    const ref = this.dialog.open(InvoiceFormDialogComponent, { width: '600px', data: { mode: 'edit', invoice: inv } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.snackBar.open('Updated', 'Close', { duration: 3000 }); } });
  }
  changeStatus(inv: InvoiceResponse, status: string) {
    this.invoiceService.changeStatus(inv.id, status).subscribe({
      next: () => { this.load(); this.loadStats(); this.snackBar.open(`Marked ${status.toLowerCase()}`, 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
    });
  }
  deleteInvoice(inv: InvoiceResponse) {
    if (confirm(`Delete ${inv.invoiceNumber}?`)) {
      this.invoiceService.deleteInvoice(inv.id).subscribe({
        next: () => { this.load(); this.loadStats(); this.snackBar.open('Deleted', 'Close', { duration: 3000 }); },
        error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
      });
    }
  }
}
