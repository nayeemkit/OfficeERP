import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PayrollService } from '@core/services/payroll.service';

@Component({
  selector: 'app-payroll-generate-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Generate Payroll</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      @if (successMessage()) { <div class="success-banner">{{ successMessage() }}</div> }
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Year</mat-label>
          <mat-select formControlName="year">
            @for (y of years; track y) { <mat-option [value]="y">{{ y }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Month</mat-label>
          <mat-select formControlName="month">
            @for (m of months; track m.value) { <mat-option [value]="m.value">{{ m.label }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <p class="hint">This will generate payslips for all active employees with salary structures.</p>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { Generate }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .error-banner { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
    .success-banner { background: #e8f5e9; color: #2e7d32; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
    .hint { font-size: 13px; color: #666; margin-top: 8px; }
  `],
})
export class PayrollGenerateDialogComponent {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  years = [2024, 2025, 2026, 2027];
  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    .map((label, i) => ({ value: i + 1, label }));

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private dialogRef: MatDialogRef<PayrollGenerateDialogComponent>,
  ) {
    const now = new Date();
    this.form = this.fb.group({
      year: [now.getFullYear(), [Validators.required]],
      month: [now.getMonth() + 1, [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.payrollService.generatePayroll(this.form.value).subscribe({
      next: (res) => {
        this.saving.set(false);
        const count = res.data.length;
        if (count > 0) {
          this.successMessage.set(`Generated ${count} payslip(s) successfully!`);
          setTimeout(() => this.dialogRef.close(true), 1500);
        } else {
          this.errorMessage.set('No payslips generated. Ensure employees have salary structures and no existing payslips for this period.');
        }
      },
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Generation failed'); },
    });
  }
}
