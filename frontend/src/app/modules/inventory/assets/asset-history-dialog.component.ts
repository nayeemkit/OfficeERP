import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AssetService } from '@core/services/asset.service';
import { AssetResponse, AssetHistoryResponse } from '@shared/models/asset.model';

@Component({
  selector: 'app-asset-history-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Asset History — {{ data.asset.name }}</h2>
    <mat-dialog-content>
      @if (loading()) {
        <div class="loading"><mat-spinner diameter="30"></mat-spinner></div>
      } @else if (history().length === 0) {
        <p class="empty">No history records found.</p>
      } @else {
        <div class="timeline">
          @for (h of history(); track h.id) {
            <div class="entry">
              <div class="action-badge" [class]="'action-' + h.action.toLowerCase()">{{ h.action.replace('_',' ') }}</div>
              <div class="details">
                @if (h.toEmployeeName) { <span>To: <strong>{{ h.toEmployeeName }}</strong></span> }
                @if (h.fromEmployeeName) { <span>From: <strong>{{ h.fromEmployeeName }}</strong></span> }
                @if (h.note) { <div class="note">{{ h.note }}</div> }
                <div class="time">{{ h.performedAt | date:'medium' }}</div>
              </div>
            </div>
          }
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .loading{display:flex;justify-content:center;padding:24px}.empty{color:#666;text-align:center;padding:24px}
    .timeline{max-height:400px;overflow-y:auto}
    .entry{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #eee}
    .action-badge{padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600;white-space:nowrap;height:fit-content;
      background:#e3f2fd;color:#1565c0}
    .action-assigned{background:#e8f5e9;color:#2e7d32}.action-unassigned{background:#fff3e0;color:#e65100}
    .action-disposed{background:#f5f5f5;color:#757575}.action-created{background:#e3f2fd;color:#1565c0}
    .action-sent_for_repair{background:#fff3e0;color:#e65100}.action-repaired{background:#e8f5e9;color:#2e7d32}
    .details{flex:1;font-size:13px}.note{color:#666;font-style:italic;margin-top:4px}
    .time{color:#999;font-size:12px;margin-top:4px}
  `],
})
export class AssetHistoryDialogComponent implements OnInit {
  history = signal<AssetHistoryResponse[]>([]);
  loading = signal(true);

  constructor(
    private assetService: AssetService,
    @Inject(MAT_DIALOG_DATA) public data: { asset: AssetResponse },
  ) {}

  ngOnInit() {
    this.assetService.getHistory(this.data.asset.id).subscribe({
      next: r => { this.history.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
