import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService } from '@core/services/inventory.service';
import { ItemResponse } from '@shared/models/inventory.model';

@Component({
  selector: 'app-stock-transaction-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Stock {{ data.type === 'IN' ? 'In' : 'Out' }}</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      <div class="item-info">
        <p><strong>{{ data.item.name }}</strong> ({{ data.item.sku }})</p>
        <p>Current stock: <strong>{{ data.item.currentStock }}</strong> {{ data.item.unit }}</p>
      </div>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width"><mat-label>Quantity</mat-label>
          <input matInput formControlName="quantity" type="number" /></mat-form-field>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Unit Price (optional)</mat-label>
          <input matInput formControlName="unitPrice" type="number" /></mat-form-field>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Reference (PO#, Invoice#)</mat-label>
          <input matInput formControlName="reference" /></mat-form-field>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Note</mat-label>
          <textarea matInput formControlName="note" rows="2"></textarea></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button [color]="data.type === 'IN' ? 'primary' : 'warn'"
              (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> }
        @else { {{ data.type === 'IN' ? 'Stock In' : 'Stock Out' }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width{width:100%}.item-info{margin-bottom:16px;padding:12px;background:#f5f5f5;border-radius:8px}.item-info p{margin:4px 0}.error-banner{background:#ffebee;color:#c62828;padding:12px;border-radius:4px;margin-bottom:16px}`],
})
export class StockTransactionDialogComponent {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder, private inventoryService: InventoryService,
    private dialogRef: MatDialogRef<StockTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: ItemResponse; type: 'IN' | 'OUT' },
  ) {
    this.form = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [data.item.unitPrice],
      reference: [''],
      note: [''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true); this.errorMessage.set('');

    this.inventoryService.createStockTransaction({
      itemId: this.data.item.id,
      type: this.data.type,
      ...this.form.value,
    }).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); },
    });
  }
}
