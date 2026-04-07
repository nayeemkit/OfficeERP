import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BudgetService } from '@core/services/invoice.service';
import { HrService } from '@core/services/hr.service';
import { DepartmentResponse } from '@shared/models/hr.model';

@Component({
  selector: 'app-budget-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Set Budget</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width"><mat-label>Department</mat-label>
          <mat-select formControlName="departmentId">
            @for (d of departments(); track d.id) { <mat-option [value]="d.id">{{ d.name }}</mat-option> }
          </mat-select></mat-form-field>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Year</mat-label>
            <mat-select formControlName="year">
              @for (y of years; track y) { <mat-option [value]="y">{{ y }}</mat-option> }
            </mat-select></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Month</mat-label>
            <mat-select formControlName="month">
              @for (m of months; track m.value) { <mat-option [value]="m.value">{{ m.label }}</mat-option> }
            </mat-select></mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Allocated Amount</mat-label><input matInput formControlName="allocated" type="number" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Spent Amount</mat-label><input matInput formControlName="spent" type="number" /></mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Notes</mat-label><input matInput formControlName="notes" /></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { Save }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width{width:100%}.row{display:flex;gap:12px}.row mat-form-field{flex:1}.error-banner{background:#ffebee;color:#c62828;padding:12px;border-radius:4px;margin-bottom:16px}`],
})
export class BudgetFormDialogComponent implements OnInit {
  form: FormGroup; saving = signal(false); errorMessage = signal('');
  departments = signal<DepartmentResponse[]>([]);
  years = [2024, 2025, 2026, 2027];
  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((l, i) => ({ value: i + 1, label: l }));

  constructor(private fb: FormBuilder, private budgetService: BudgetService, private hrService: HrService,
    private dialogRef: MatDialogRef<BudgetFormDialogComponent>) {
    const now = new Date();
    this.form = this.fb.group({
      departmentId: [null, [Validators.required]], year: [now.getFullYear(), [Validators.required]],
      month: [now.getMonth() + 1, [Validators.required]], allocated: [0, [Validators.required, Validators.min(0)]],
      spent: [0], notes: [''],
    });
  }

  ngOnInit() { this.hrService.getActiveDepartments().subscribe({ next: r => this.departments.set(r.data) }); }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true); this.errorMessage.set('');
    this.budgetService.save(this.form.value).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); },
    });
  }
}
