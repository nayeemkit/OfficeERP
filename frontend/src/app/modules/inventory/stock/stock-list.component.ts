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
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { InventoryService } from '@core/services/inventory.service';
import { StockTransactionResponse } from '@shared/models/inventory.model';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatCardModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <div class="stock-page">
      <div class="toolbar">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="typeFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="IN">Stock In</mat-option>
            <mat-option value="OUT">Stock Out</mat-option>
            <mat-option value="ADJUSTMENT">Adjustment</mat-option>
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
      </div>

      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="item">
            <th mat-header-cell *matHeaderCellDef>Item</th>
            <td mat-cell *matCellDef="let t">
              <div class="item-name">{{ t.itemName }}</div>
              <div class="item-sub">{{ t.itemSku }} · {{ t.categoryName }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let t">
              <span class="type-chip" [class]="'type-' + t.type.toLowerCase()">{{ t.type }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Qty</th>
            <td mat-cell *matCellDef="let t">
              <span [class.text-green]="t.type === 'IN'" [class.text-red]="t.type === 'OUT'">
                {{ t.type === 'IN' ? '+' : t.type === 'OUT' ? '-' : '' }}{{ t.quantity }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="totalPrice">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let t">{{ t.totalPrice | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef>Reference</th>
            <td mat-cell *matCellDef="let t">{{ t.reference || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let t">{{ t.transactionDate | date:'mediumDate' }}</td>
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
    .stock-page { padding: 24px; }
    .toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
    .filter-field { width: 180px; }
    table { width: 100%; }
    .item-name { font-weight: 500; }
    .item-sub { font-size: 12px; color: #666; }
    .type-chip { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .type-in { background: #e8f5e9; color: #2e7d32; }
    .type-out { background: #ffebee; color: #c62828; }
    .type-adjustment { background: #e3f2fd; color: #1565c0; }
    .text-green { color: #2e7d32; font-weight: 600; }
    .text-red { color: #c62828; font-weight: 600; }
    .loading { display: flex; justify-content: center; padding: 48px; }
  `],
})
export class StockListComponent implements OnInit {
  displayedColumns = ['item', 'type', 'quantity', 'totalPrice', 'reference', 'date'];
  dataSource = new MatTableDataSource<StockTransactionResponse>([]);
  loading = signal(true);
  typeFilter: string | null = null;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  total = 0;
  pageSize = 20;
  page = 0;

  constructor(private inventoryService: InventoryService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load(): void {
    this.loading.set(true);
    const df = this.dateFrom ? this.dateFrom.toISOString().split('T')[0] : undefined;
    const dt = this.dateTo ? this.dateTo.toISOString().split('T')[0] : undefined;
    this.inventoryService.getStockTransactions(this.page, this.pageSize, undefined,
      this.typeFilter || undefined, df, dt
    ).subscribe({
      next: res => { this.dataSource.data = res.data.content; this.total = res.data.totalElements; this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Failed to load', 'Close', { duration: 3000 }); },
    });
  }

  onPage(e: PageEvent) { this.page = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
}
