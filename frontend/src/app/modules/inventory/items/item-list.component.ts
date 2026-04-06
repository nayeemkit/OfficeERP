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
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventoryService } from '@core/services/inventory.service';
import { ItemResponse, CategoryResponse, InventoryStats } from '@shared/models/inventory.model';
import { ItemFormDialogComponent } from './item-form-dialog.component';
import { StockTransactionDialogComponent } from './stock-transaction-dialog.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatCardModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatChipsModule,MatTooltipModule
  ],
  template: `
    <div class="inventory-page">
      @if (stats()) {
        <div class="stats-row">
          <mat-card class="stat-card">
            <div class="stat-value">{{ stats()!.totalItems }}</div>
            <div class="stat-label">Total items</div>
          </mat-card>
          <mat-card class="stat-card low">
            <div class="stat-value">{{ stats()!.lowStockItems }}</div>
            <div class="stat-label">Low stock alerts</div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-value">{{ stats()!.totalTransactions }}</div>
            <div class="stat-label">Total transactions</div>
          </mat-card>
        </div>
      }

      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search items</mat-label>
          <input matInput [(ngModel)]="search" (keyup.enter)="load()" placeholder="Name or SKU..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="categoryFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            @for (cat of categories(); track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <span class="spacer"></span>

        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon> Add Item
        </button>
      </div>

      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="item">
            <th mat-header-cell *matHeaderCellDef>Item</th>
            <td mat-cell *matCellDef="let i">
              <div class="item-name">{{ i.name }}</div>
              <div class="item-sub">{{ i.sku }} · {{ i.categoryName || 'Uncategorized' }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="unit">
            <th mat-header-cell *matHeaderCellDef>Unit</th>
            <td mat-cell *matCellDef="let i">{{ i.unit }}</td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Unit Price</th>
            <td mat-cell *matCellDef="let i">{{ i.unitPrice | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef>Stock</th>
            <td mat-cell *matCellDef="let i">
              <span [class.low-stock]="i.lowStock">{{ i.currentStock }}</span>
              @if (i.lowStock) {
                <mat-icon class="low-icon" matTooltip="Below reorder level ({{ i.reorderLevel }})">warning</mat-icon>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="reorder">
            <th mat-header-cell *matHeaderCellDef>Reorder Level</th>
            <td mat-cell *matCellDef="let i">{{ i.reorderLevel }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let i">
              <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="openStockDialog(i, 'IN')">
                  <mat-icon>add_circle</mat-icon> Stock In
                </button>
                <button mat-menu-item (click)="openStockDialog(i, 'OUT')">
                  <mat-icon>remove_circle</mat-icon> Stock Out
                </button>
                <button mat-menu-item (click)="openEditDialog(i)">
                  <mat-icon>edit</mat-icon> Edit
                </button>
                <button mat-menu-item (click)="deleteItem(i)">
                  <mat-icon>delete</mat-icon> Delete
                </button>
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
    .inventory-page { padding: 24px; }
    .stats-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { text-align: center; padding: 16px; }
    .stat-value { font-size: 28px; font-weight: 500; }
    .stat-label { font-size: 13px; color: #666; margin-top: 4px; }
    .stat-card.low .stat-value { color: #f44336; }
    .toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
    .search-field { flex: 1; min-width: 250px; }
    .filter-field { width: 180px; }
    .spacer { flex: 1; }
    table { width: 100%; }
    .item-name { font-weight: 500; }
    .item-sub { font-size: 12px; color: #666; }
    .low-stock { color: #f44336; font-weight: 600; }
    .low-icon { font-size: 18px; color: #ff9800; vertical-align: middle; margin-left: 4px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
  `],
})
export class ItemListComponent implements OnInit {
  displayedColumns = ['item', 'unit', 'price', 'stock', 'reorder', 'actions'];
  dataSource = new MatTableDataSource<ItemResponse>([]);
  stats = signal<InventoryStats | null>(null);
  categories = signal<CategoryResponse[]>([]);
  loading = signal(true);
  search = '';
  categoryFilter: string | null = null;
  total = 0;
  pageSize = 20;
  page = 0;

  constructor(
    private inventoryService: InventoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); this.loadStats(); this.loadCategories(); }

  load(): void {
    this.loading.set(true);
    this.inventoryService.getItems(this.page, this.pageSize, this.search || undefined,
      this.categoryFilter || undefined
    ).subscribe({
      next: res => { this.dataSource.data = res.data.content; this.total = res.data.totalElements; this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Failed to load', 'Close', { duration: 3000 }); },
    });
  }

  loadStats(): void {
    this.inventoryService.getStats().subscribe({ next: res => this.stats.set(res.data) });
  }

  loadCategories(): void {
    this.inventoryService.getCategories().subscribe({ next: res => this.categories.set(res.data) });
  }

  onPage(e: PageEvent) { this.page = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  openCreateDialog(): void {
    const ref = this.dialog.open(ItemFormDialogComponent, { width: '550px', data: { mode: 'create' } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadStats(); this.snackBar.open('Item created', 'Close', { duration: 3000 }); } });
  }

  openEditDialog(item: ItemResponse): void {
    const ref = this.dialog.open(ItemFormDialogComponent, { width: '550px', data: { mode: 'edit', item } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.snackBar.open('Item updated', 'Close', { duration: 3000 }); } });
  }

  openStockDialog(item: ItemResponse, type: 'IN' | 'OUT'): void {
    const ref = this.dialog.open(StockTransactionDialogComponent, { width: '450px', data: { item, type } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadStats(); this.snackBar.open(`Stock ${type.toLowerCase()} recorded`, 'Close', { duration: 3000 }); } });
  }

  deleteItem(item: ItemResponse): void {
    if (confirm(`Delete ${item.name}?`)) {
      this.inventoryService.deleteItem(item.id).subscribe({
        next: () => { this.load(); this.loadStats(); this.snackBar.open('Deleted', 'Close', { duration: 3000 }); },
        error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
      });
    }
  }
}
