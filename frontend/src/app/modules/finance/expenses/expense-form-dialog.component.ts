import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FinanceService } from '@core/services/finance.service';
import { HrService } from '@core/services/hr.service';
import { ExpenseCategoryResponse } from '@shared/models/finance.model';
import { EmployeeResponse } from '@shared/models/hr.model';

@Component({
  selector: 'app-expense-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Submit Expense</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width"><mat-label>Employee</mat-label>
          <mat-select formControlName="employeeId">
            @for (emp of employees(); track emp.id) { <mat-option [value]="emp.id">{{ emp.fullName }} ({{ emp.employeeCode }})</mat-option> }
          </mat-select></mat-form-field>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Category</mat-label>
          <mat-select formControlName="categoryId">
            @for (cat of categories(); track cat.id) { <mat-option [value]="cat.id">{{ cat.name }}</mat-option> }
          </mat-select></mat-form-field>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Amount</mat-label>
            <input matInput formControlName="amount" type="number" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Date</mat-label>
            <input matInput [matDatepicker]="dp" formControlName="expenseDate" />
            <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle><mat-datepicker #dp></mat-datepicker></mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea></mat-form-field>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Receipt Reference (optional)</mat-label>
          <input matInput formControlName="receiptRef" placeholder="Invoice #, receipt #, etc." /></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { Submit }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width{width:100%}.row{display:flex;gap:12px}.row mat-form-field{flex:1}.error-banner{background:#ffebee;color:#c62828;padding:12px;border-radius:4px;margin-bottom:16px}`],
})
export class ExpenseFormDialogComponent implements OnInit {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');
  employees = signal<EmployeeResponse[]>([]);
  categories = signal<ExpenseCategoryResponse[]>([]);

  constructor(
    private fb: FormBuilder, private financeService: FinanceService, private hrService: HrService,
    private dialogRef: MatDialogRef<ExpenseFormDialogComponent>,
  ) {
    this.form = this.fb.group({
      employeeId: [null, [Validators.required]],
      categoryId: [null, [Validators.required]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      expenseDate: [new Date(), [Validators.required]],
      description: ['', [Validators.required]],
      receiptRef: [''],
    });
  }

  ngOnInit() {
    this.hrService.getEmployees(0, 100).subscribe({ next: r => this.employees.set(r.data.content) });
    this.financeService.getCategories().subscribe({ next: r => this.categories.set(r.data) });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true); this.errorMessage.set('');
    const val = { ...this.form.value };
    if (val.expenseDate instanceof Date) val.expenseDate = val.expenseDate.toISOString().split('T')[0];
    this.financeService.submitExpense(val).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); },
    });
  }
}
