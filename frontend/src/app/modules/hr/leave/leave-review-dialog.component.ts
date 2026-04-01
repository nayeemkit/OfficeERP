import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeaveService } from '@core/services/leave.service';
import { LeaveRequestResponse } from '@shared/models/leave.model';

@Component({
  selector: 'app-leave-review-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>{{ data.action === 'APPROVED' ? 'Approve' : 'Reject' }} Leave</h2>
    <mat-dialog-content>
      <div class="info">
        <p><strong>{{ data.request.employeeName }}</strong> ({{ data.request.employeeCode }})</p>
        <p>{{ data.request.leaveTypeName }} · {{ data.request.totalDays }} day(s)</p>
        <p>{{ data.request.startDate | date:'mediumDate' }} — {{ data.request.endDate | date:'mediumDate' }}</p>
        @if (data.request.reason) { <p class="reason">Reason: {{ data.request.reason }}</p> }
      </div>

      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }

      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Comment (optional)</mat-label>
          <textarea matInput formControlName="comment" rows="3"></textarea>
        </mat-form-field>
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
  styles: [`
    .full-width { width: 100%; }
    .info { margin-bottom: 16px; }
    .info p { margin: 4px 0; }
    .reason { font-style: italic; color: #666; }
    .error-banner { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
  `],
})
export class LeaveReviewDialogComponent {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private dialogRef: MatDialogRef<LeaveReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { request: LeaveRequestResponse; action: 'APPROVED' | 'REJECTED' },
  ) {
    this.form = this.fb.group({ comment: [''] });
  }

  onSubmit(): void {
    this.saving.set(true);
    this.errorMessage.set('');

    this.leaveService.reviewLeave(this.data.request.id, {
      status: this.data.action,
      comment: this.form.value.comment,
    }).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Review failed'); },
    });
  }
}
