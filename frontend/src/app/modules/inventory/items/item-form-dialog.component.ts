import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService } from '@core/services/inventory.service';
import { ItemResponse, CategoryResponse } from '@shared/models/inventory.model';

@Component({
  selector: 'app-item-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Item' : 'Edit Item' }}</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      <form [formGroup]="form">
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Name</mat-label>
            <input matInput formControlName="name" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>SKU</mat-label>
            <input matInput formControlName="sku" /></mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Category</mat-label>
          <mat-select formControlName="categoryId">
            <mat-option [value]="null">None</mat-option>
            @for (cat of categories(); track cat.id) { <mat-option [value]="cat.id">{{ cat.name }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea></mat-form-field>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Unit</mat-label>
            <mat-select formControlName="unit">
              @for (u of units; track u) { <mat-option [value]="u">{{ u }}</mat-option> }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Unit Price</mat-label>
            <input matInput formControlName="unitPrice" type="number" /></mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Reorder Level</mat-label>
          <input matInput formControlName="reorderLevel" type="number" /></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { {{ data.mode === 'create' ? 'Create' : 'Save' }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width{width:100%}.row{display:flex;gap:12px}.row mat-form-field{flex:1}.error-banner{background:#ffebee;color:#c62828;padding:12px;border-radius:4px;margin-bottom:16px}`],
})
export class ItemFormDialogComponent implements OnInit {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');
  categories = signal<CategoryResponse[]>([]);
  units = ['PCS', 'BOX', 'REAM', 'KG', 'LITER', 'SET', 'PACK', 'ROLL', 'PAIR'];

  constructor(
    private fb: FormBuilder, private inventoryService: InventoryService,
    private dialogRef: MatDialogRef<ItemFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; item?: ItemResponse },
  ) {
    const isEdit = data.mode === 'edit';
    const i = data.item;
    this.form = this.fb.group({
      name: [isEdit ? i?.name : '', [Validators.required]],
      sku: [isEdit ? i?.sku : '', [Validators.required]],
      categoryId: [isEdit ? i?.categoryId : null],
      description: [isEdit ? i?.description : ''],
      unit: [isEdit ? i?.unit : 'PCS', [Validators.required]],
      unitPrice: [isEdit ? i?.unitPrice : 0],
      reorderLevel: [isEdit ? i?.reorderLevel : 10],
    });
  }

  ngOnInit(): void {
    this.inventoryService.getCategories().subscribe({ next: res => this.categories.set(res.data) });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true); this.errorMessage.set('');
    const obs = this.data.mode === 'edit'
      ? this.inventoryService.updateItem(this.data.item!.id, this.form.value)
      : this.inventoryService.createItem(this.form.value);
    obs.subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); },
    });
  }
}
