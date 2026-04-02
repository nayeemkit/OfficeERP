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
import { AttendanceService } from '@core/services/attendance.service';
import { HrService } from '@core/services/hr.service';
import { EmployeeResponse } from '@shared/models/hr.model';

@Component({
  selector: 'app-attendance-manual-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Manual Attendance Entry</h2>
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
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="PRESENT">Present</mat-option>
            <mat-option value="ABSENT">Absent</mat-option>
            <mat-option value="LATE">Late</mat-option>
            <mat-option value="HALF_DAY">Half Day</mat-option>
            <mat-option value="ON_LEAVE">On Leave</mat-option>
            <mat-option value="WEEKEND">Weekend</mat-option>
            <mat-option value="HOLIDAY">Holiday</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Check-in time (e.g. 09:00)</mat-label>
            <input matInput formControlName="checkInTime" type="time" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Check-out time (e.g. 18:00)</mat-label>
            <input matInput formControlName="checkOutTime" type="time" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Remarks</mat-label>
          <input matInput formControlName="remarks" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { Save }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
    .error-banner { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
  `],
})
export class AttendanceManualDialogComponent implements OnInit {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');
  employees = signal<EmployeeResponse[]>([]);

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private hrService: HrService,
    private dialogRef: MatDialogRef<AttendanceManualDialogComponent>,
  ) {
    this.form = this.fb.group({
      employeeId: [null, [Validators.required]],
      date: [new Date(), [Validators.required]],
      status: ['PRESENT', [Validators.required]],
      checkInTime: ['09:00'],
      checkOutTime: ['18:00'],
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

    const val = this.form.value;
    const dateStr = val.date instanceof Date ? val.date.toISOString().split('T')[0] : val.date;

    const request: any = {
      employeeId: val.employeeId,
      date: dateStr,
      status: val.status,
      remarks: val.remarks,
    };

    if (val.checkInTime) {
      request.checkIn = `${dateStr}T${val.checkInTime}:00`;
    }
    if (val.checkOutTime) {
      request.checkOut = `${dateStr}T${val.checkOutTime}:00`;
    }

    this.attendanceService.markManual(request).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); },
    });
  }
}
