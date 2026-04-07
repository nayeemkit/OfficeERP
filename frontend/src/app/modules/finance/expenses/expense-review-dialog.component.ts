import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FinanceService } from '@core/services/finance.service';
import { ExpenseResponse } from '@shared/models/finance.model';

@Component({
  selector: 'app-expense-review-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>{{ data.action === 'APPROVED' ? 'Approve' : 'Reject' }} Expense</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      <div class="info">
        <p><strong>{{ data.expense.expenseNumber }}</strong> — {{ data.expense.employeeName }}</p>
        <p>{{ data.expense.categoryName }} · <strong>{{ data.expense.amount | number:'1.2-2' }}</strong></p>
        <p>{{ data.expense.expenseDate | date:'mediumDate' }}</p>
        <p class="desc">{{ data.expense.description }}</p>
      </div>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width"><mat-label>Comment (optional)</mat-label>
          <textarea matInput formControlName="comment" rows="3"></textarea></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button [color]="data.action === 'APPROVED' ? 'primary' : 'warn'"
              (click)="onSubmit()" [disabled]="saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> }
        @else { {{ data.action === 'APPROVED' ? 'Approve' : 'Reject' }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width{width:100%}.info{margin-bottom:16px;padding:12px;background:#f5f5f5;border-radius:8px}.info p{margin:4px 0}.desc{font-style:italic;color:#666}.error-banner{background:#ffebee;color:#c62828;padding:12px;border-radius:4px;margin-bottom:16px}`],
})
export class ExpenseReviewDialogComponent {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder, private financeService: FinanceService,
    private dialogRef: MatDialogRef<ExpenseReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expense: ExpenseResponse; action: 'APPROVED' | 'REJECTED' },
  ) {
    this.form = this.fb.group({ comment: [''] });
  }

  onSubmit(): void {
    this.saving.set(true); this.errorMessage.set('');
    this.financeService.reviewExpense(this.data.expense.id, {
      status: this.data.action, comment: this.form.value.comment,
    }).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); },
    });
  }
}
