import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvoiceService } from '@core/services/invoice.service';
import { InvoiceResponse } from '@shared/models/invoice.model';

@Component({
  selector: 'app-invoice-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'New Invoice' : 'Edit Invoice' }}</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width"><mat-label>Client Name</mat-label><input matInput formControlName="clientName" /></mat-form-field>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Client Email</mat-label><input matInput formControlName="clientEmail" type="email" /></mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Client Address</mat-label><textarea matInput formControlName="clientAddress" rows="2"></textarea></mat-form-field>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Amount</mat-label><input matInput formControlName="amount" type="number" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Tax Amount</mat-label><input matInput formControlName="taxAmount" type="number" /></mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Issue Date</mat-label>
            <input matInput [matDatepicker]="ip" formControlName="issueDate" /><mat-datepicker-toggle matSuffix [for]="ip"></mat-datepicker-toggle><mat-datepicker #ip></mat-datepicker></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Due Date</mat-label>
            <input matInput [matDatepicker]="dp" formControlName="dueDate" /><mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle><mat-datepicker #dp></mat-datepicker></mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Notes</mat-label><textarea matInput formControlName="notes" rows="2"></textarea></mat-form-field>
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
export class InvoiceFormDialogComponent {
  form: FormGroup; saving = signal(false); errorMessage = signal('');

  constructor(
    private fb: FormBuilder, private invoiceService: InvoiceService,
    private dialogRef: MatDialogRef<InvoiceFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; invoice?: InvoiceResponse },
  ) {
    const isEdit = data.mode === 'edit'; const inv = data.invoice;
    this.form = this.fb.group({
      clientName: [isEdit ? inv?.clientName : '', [Validators.required]],
      clientEmail: [isEdit ? inv?.clientEmail : ''],
      clientAddress: [isEdit ? inv?.clientAddress : ''],
      amount: [isEdit ? inv?.amount : null, [Validators.required, Validators.min(0.01)]],
      taxAmount: [isEdit ? inv?.taxAmount : 0],
      issueDate: [isEdit && inv?.issueDate ? new Date(inv.issueDate) : new Date(), [Validators.required]],
      dueDate: [isEdit && inv?.dueDate ? new Date(inv.dueDate) : null, [Validators.required]],
      notes: [isEdit ? inv?.notes : ''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true); this.errorMessage.set('');
    const val = { ...this.form.value };
    if (val.issueDate instanceof Date) val.issueDate = val.issueDate.toISOString().split('T')[0];
    if (val.dueDate instanceof Date) val.dueDate = val.dueDate.toISOString().split('T')[0];

    const obs = this.data.mode === 'edit'
      ? this.invoiceService.update(this.data.invoice!.id, val)
      : this.invoiceService.create(val);
    obs.subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); },
    });
  }
}
