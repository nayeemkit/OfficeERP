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
import { MatTooltipModule } from '@angular/material/tooltip';
import { AssetService } from '@core/services/asset.service';
import { InventoryService } from '@core/services/inventory.service';
import { AssetResponse, AssetStats } from '@shared/models/asset.model';
import { CategoryResponse } from '@shared/models/inventory.model';
import { AssetFormDialogComponent } from './asset-form-dialog.component';
import { AssetAssignDialogComponent } from './asset-assign-dialog.component';
import { AssetHistoryDialogComponent } from './asset-history-dialog.component';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatCardModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  template: `
    <div class="asset-page">
      @if (stats()) {
        <div class="stats-row">
          <mat-card class="stat-card"><div class="stat-value">{{ stats()!.totalAssets }}</div><div class="stat-label">Total assets</div></mat-card>
          <mat-card class="stat-card available"><div class="stat-value">{{ stats()!.available }}</div><div class="stat-label">Available</div></mat-card>
          <mat-card class="stat-card assigned"><div class="stat-value">{{ stats()!.assigned }}</div><div class="stat-label">Assigned</div></mat-card>
          <mat-card class="stat-card repair"><div class="stat-value">{{ stats()!.underRepair }}</div><div class="stat-label">Under repair</div></mat-card>
          <mat-card class="stat-card disposed"><div class="stat-value">{{ stats()!.disposed }}</div><div class="stat-label">Disposed</div></mat-card>
        </div>
      }

      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search assets</mat-label>
          <input matInput [(ngModel)]="search" (keyup.enter)="load()" placeholder="Name, code, serial..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="categoryFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            @for (cat of categories(); track cat.id) { <mat-option [value]="cat.id">{{ cat.name }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="load()">
            <mat-option [value]="null">All</mat-option>
            <mat-option value="AVAILABLE">Available</mat-option>
            <mat-option value="ASSIGNED">Assigned</mat-option>
            <mat-option value="UNDER_REPAIR">Under Repair</mat-option>
            <mat-option value="DISPOSED">Disposed</mat-option>
          </mat-select>
        </mat-form-field>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="openCreate()"><mat-icon>add</mat-icon> Add Asset</button>
      </div>

      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="asset">
            <th mat-header-cell *matHeaderCellDef>Asset</th>
            <td mat-cell *matCellDef="let a">
              <div class="item-name">{{ a.name }}</div>
              <div class="item-sub">{{ a.assetCode }} · {{ a.categoryName || 'N/A' }}</div>
            </td>
          </ng-container>
          <ng-container matColumnDef="serial">
            <th mat-header-cell *matHeaderCellDef>Serial #</th>
            <td mat-cell *matCellDef="let a">{{ a.serialNumber || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="assignedTo">
            <th mat-header-cell *matHeaderCellDef>Assigned To</th>
            <td mat-cell *matCellDef="let a">
              @if (a.assignedToName) {
                <div>{{ a.assignedToName }}</div>
                <div class="item-sub">{{ a.assignedToCode }}</div>
              } @else { - }
            </td>
          </ng-container>
          <ng-container matColumnDef="condition">
            <th mat-header-cell *matHeaderCellDef>Condition</th>
            <td mat-cell *matCellDef="let a">{{ a.condition | titlecase }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let a">
              <span class="status-chip" [class]="'status-' + a.status.toLowerCase()">{{ a.status.replace('_',' ') | titlecase }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let a">
              <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
              <mat-menu #menu="matMenu">
                @if (a.status === 'AVAILABLE') {
                  <button mat-menu-item (click)="openAssign(a)"><mat-icon>person_add</mat-icon> Assign</button>
                }
                @if (a.status === 'ASSIGNED') {
                  <button mat-menu-item (click)="unassign(a)"><mat-icon>person_remove</mat-icon> Unassign</button>
                }
                <button mat-menu-item (click)="openEdit(a)"><mat-icon>edit</mat-icon> Edit</button>
                <button mat-menu-item (click)="openHistory(a)"><mat-icon>history</mat-icon> History</button>
                @if (a.status !== 'DISPOSED') {
                  <button mat-menu-item (click)="changeStatus(a, 'UNDER_REPAIR')"><mat-icon>build</mat-icon> Send for Repair</button>
                  <button mat-menu-item (click)="changeStatus(a, 'DISPOSED')"><mat-icon>delete_forever</mat-icon> Dispose</button>
                }
                @if (a.status === 'UNDER_REPAIR') {
                  <button mat-menu-item (click)="changeStatus(a, 'AVAILABLE')"><mat-icon>check_circle</mat-icon> Mark Repaired</button>
                }
                <button mat-menu-item (click)="deleteAsset(a)"><mat-icon>delete</mat-icon> Delete</button>
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
    .asset-page{padding:24px}
    .stats-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:24px}
    .stat-card{text-align:center;padding:14px}.stat-value{font-size:26px;font-weight:500}.stat-label{font-size:12px;color:#666;margin-top:2px}
    .stat-card.available .stat-value{color:#4caf50}.stat-card.assigned .stat-value{color:#2196f3}
    .stat-card.repair .stat-value{color:#ff9800}.stat-card.disposed .stat-value{color:#9e9e9e}
    .toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
    .search-field{flex:1;min-width:250px}.filter-field{width:160px}.spacer{flex:1}
    table{width:100%}.item-name{font-weight:500}.item-sub{font-size:12px;color:#666}
    .status-chip{padding:4px 10px;border-radius:12px;font-size:12px;font-weight:500}
    .status-available{background:#e8f5e9;color:#2e7d32}.status-assigned{background:#e3f2fd;color:#1565c0}
    .status-under_repair{background:#fff3e0;color:#e65100}.status-disposed{background:#f5f5f5;color:#757575}
    .status-lost{background:#ffebee;color:#c62828}
    .loading{display:flex;justify-content:center;padding:48px}
  `],
})
export class AssetListComponent implements OnInit {
  displayedColumns = ['asset', 'serial', 'assignedTo', 'condition', 'status', 'actions'];
  dataSource = new MatTableDataSource<AssetResponse>([]);
  stats = signal<AssetStats | null>(null);
  categories = signal<CategoryResponse[]>([]);
  loading = signal(true);
  search = '';
  categoryFilter: string | null = null;
  statusFilter: string | null = null;
  total = 0; pageSize = 20; page = 0;

  constructor(
    private assetService: AssetService, private inventoryService: InventoryService,
    private dialog: MatDialog, private snackBar: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); this.loadStats(); this.inventoryService.getCategories().subscribe({ next: r => this.categories.set(r.data) }); }

  load(): void {
    this.loading.set(true);
    this.assetService.getAll(this.page, this.pageSize, this.search || undefined, this.categoryFilter || undefined, this.statusFilter || undefined).subscribe({
      next: r => { this.dataSource.data = r.data.content; this.total = r.data.totalElements; this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Failed to load', 'Close', { duration: 3000 }); },
    });
  }

  loadStats() { this.assetService.getStats().subscribe({ next: r => this.stats.set(r.data) }); }
  onPage(e: PageEvent) { this.page = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  openCreate() {
    const ref = this.dialog.open(AssetFormDialogComponent, { width: '600px', data: { mode: 'create' } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadStats(); this.snackBar.open('Asset created', 'Close', { duration: 3000 }); } });
  }

  openEdit(asset: AssetResponse) {
    const ref = this.dialog.open(AssetFormDialogComponent, { width: '600px', data: { mode: 'edit', asset } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.snackBar.open('Asset updated', 'Close', { duration: 3000 }); } });
  }

  openAssign(asset: AssetResponse) {
    const ref = this.dialog.open(AssetAssignDialogComponent, { width: '450px', data: { asset } });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.loadStats(); this.snackBar.open('Asset assigned', 'Close', { duration: 3000 }); } });
  }

  unassign(asset: AssetResponse) {
    if (confirm(`Unassign ${asset.name} from ${asset.assignedToName}?`)) {
      this.assetService.unassign(asset.id).subscribe({
        next: () => { this.load(); this.loadStats(); this.snackBar.open('Asset unassigned', 'Close', { duration: 3000 }); },
        error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
      });
    }
  }

  changeStatus(asset: AssetResponse, status: string) {
    this.assetService.changeStatus(asset.id, status).subscribe({
      next: () => { this.load(); this.loadStats(); this.snackBar.open('Status updated', 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
    });
  }

  openHistory(asset: AssetResponse) {
    this.dialog.open(AssetHistoryDialogComponent, { width: '550px', data: { asset } });
  }

  deleteAsset(asset: AssetResponse) {
    if (confirm(`Delete ${asset.name}?`)) {
      this.assetService.deleteAsset(asset.id).subscribe({
        next: () => { this.load(); this.loadStats(); this.snackBar.open('Deleted', 'Close', { duration: 3000 }); },
        error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
      });
    }
  }
}
