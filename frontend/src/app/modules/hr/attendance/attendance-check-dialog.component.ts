import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AttendanceService } from '@core/services/attendance.service';
import { HrService } from '@core/services/hr.service';
import { EmployeeResponse } from '@shared/models/hr.model';

@Component({
  selector: 'app-attendance-check-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>{{ data.type === 'in' ? 'Check In' : 'Check Out' }}</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Employee</mat-label>
          <mat-select formControlName="employeeId">
            @for (emp of employees(); track emp.id) {
              <mat-option [value]="emp.id">{{ emp.fullName }} ({{ emp.employeeCode }})</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Remarks (optional)</mat-label>
          <input matInput formControlName="remarks" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> }
        @else { {{ data.type === 'in' ? 'Check In' : 'Check Out' }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; } .error-banner { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }`],
})
export class AttendanceCheckDialogComponent implements OnInit {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');
  employees = signal<EmployeeResponse[]>([]);

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private hrService: HrService,
    private dialogRef: MatDialogRef<AttendanceCheckDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: 'in' | 'out' },
  ) {
    this.form = this.fb.group({
      employeeId: [null, [Validators.required]],
      remarks: [''],
    });
  }

  ngOnInit(): void {
    this.hrService.getEmployees(0, 100).subscribe({ next: res => this.employees.set(res.data.content) });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');

    const obs = this.data.type === 'in'
      ? this.attendanceService.checkIn(this.form.value)
      : this.attendanceService.checkOut(this.form.value);

    obs.subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); },
    });
  }
}
