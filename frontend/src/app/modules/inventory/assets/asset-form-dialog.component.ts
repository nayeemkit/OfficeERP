import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AssetService } from '@core/services/asset.service';
import { InventoryService } from '@core/services/inventory.service';
import { AssetResponse } from '@shared/models/asset.model';
import { CategoryResponse } from '@shared/models/inventory.model';

@Component({
  selector: 'app-asset-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Register Asset' : 'Edit Asset' }}</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width"><mat-label>Name</mat-label><input matInput formControlName="name" /></mat-form-field>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Category</mat-label>
            <mat-select formControlName="categoryId"><mat-option [value]="null">None</mat-option>
              @for (c of categories(); track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
            </mat-select></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Serial Number</mat-label><input matInput formControlName="serialNumber" /></mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Purchase Date</mat-label>
            <input matInput [matDatepicker]="pp" formControlName="purchaseDate" /><mat-datepicker-toggle matSuffix [for]="pp"></mat-datepicker-toggle><mat-datepicker #pp></mat-datepicker></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Purchase Price</mat-label><input matInput formControlName="purchasePrice" type="number" /></mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Warranty Expiry</mat-label>
            <input matInput [matDatepicker]="wp" formControlName="warrantyExpiry" /><mat-datepicker-toggle matSuffix [for]="wp"></mat-datepicker-toggle><mat-datepicker #wp></mat-datepicker></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Condition</mat-label>
            <mat-select formControlName="condition">
              <mat-option value="NEW">New</mat-option><mat-option value="GOOD">Good</mat-option>
              <mat-option value="FAIR">Fair</mat-option><mat-option value="POOR">Poor</mat-option>
            </mat-select></mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Location</mat-label><input matInput formControlName="location" /></mat-form-field>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="2"></textarea></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { {{ data.mode === 'create' ? 'Register' : 'Save' }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width{width:100%}.row{display:flex;gap:12px}.row mat-form-field{flex:1}.error-banner{background:#ffebee;color:#c62828;padding:12px;border-radius:4px;margin-bottom:16px}`],
})
export class AssetFormDialogComponent implements OnInit {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');
  categories = signal<CategoryResponse[]>([]);

  constructor(
    private fb: FormBuilder, private assetService: AssetService, private inventoryService: InventoryService,
    private dialogRef: MatDialogRef<AssetFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; asset?: AssetResponse },
  ) {
    const isEdit = data.mode === 'edit'; const a = data.asset;
    this.form = this.fb.group({
      name: [isEdit ? a?.name : '', [Validators.required]], categoryId: [isEdit ? a?.categoryId : null],
      serialNumber: [isEdit ? a?.serialNumber : ''], purchaseDate: [isEdit && a?.purchaseDate ? new Date(a.purchaseDate) : null],
      purchasePrice: [isEdit ? a?.purchasePrice : null], warrantyExpiry: [isEdit && a?.warrantyExpiry ? new Date(a.warrantyExpiry) : null],
      location: [isEdit ? a?.location : ''], condition: [isEdit ? a?.condition : 'GOOD'],
      description: [isEdit ? a?.description : ''],
    });
  }

  ngOnInit() { this.inventoryService.getCategories().subscribe({ next: r => this.categories.set(r.data) }); }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true); this.errorMessage.set('');
    const val = { ...this.form.value };
    if (val.purchaseDate instanceof Date) val.purchaseDate = val.purchaseDate.toISOString().split('T')[0];
    if (val.warrantyExpiry instanceof Date) val.warrantyExpiry = val.warrantyExpiry.toISOString().split('T')[0];

    const obs = this.data.mode === 'edit' ? this.assetService.update(this.data.asset!.id, val) : this.assetService.create(val);
    obs.subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); },
    });
  }
}
