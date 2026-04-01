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
import { MatCardModule } from '@angular/material/card';
import { LeaveService } from '@core/services/leave.service';
import { HrService } from '@core/services/hr.service';
import { LeaveTypeResponse, LeaveBalanceResponse } from '@shared/models/leave.model';
import { EmployeeResponse } from '@shared/models/hr.model';
import { PageResponse } from '@shared/models/user.model';

@Component({
  selector: 'app-leave-apply-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule, MatCardModule,
  ],
  template: `
    <h2 mat-dialog-title>Apply for Leave</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }

      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Employee</mat-label>
          <mat-select formControlName="employeeId" (selectionChange)="onEmployeeChange($event.value)">
            @for (emp of employees(); track emp.id) {
              <mat-option [value]="emp.id">{{ emp.fullName }} ({{ emp.employeeCode }})</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Leave type</mat-label>
          <mat-select formControlName="leaveTypeId">
            @for (lt of leaveTypes(); track lt.id) {
              <mat-option [value]="lt.id">{{ lt.name }} ({{ lt.defaultDays }} days/year)</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (balances().length > 0) {
          <div class="balances-row">
            @for (b of balances(); track b.id) {
              <div class="balance-chip" [class.low]="b.availableDays <= 2">
                {{ b.leaveTypeName }}: {{ b.availableDays }} left
              </div>
            }
          </div>
        }

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Start date</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>End date</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reason</mat-label>
          <textarea matInput formControlName="reason" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { Submit }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
    .error-banner { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
    .balances-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .balance-chip { padding: 4px 10px; border-radius: 12px; font-size: 12px; background: #e8f5e9; color: #2e7d32; }
    .balance-chip.low { background: #fff3e0; color: #e65100; }
  `],
})
export class LeaveApplyDialogComponent implements OnInit {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');
  employees = signal<EmployeeResponse[]>([]);
  leaveTypes = signal<LeaveTypeResponse[]>([]);
  balances = signal<LeaveBalanceResponse[]>([]);

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private hrService: HrService,
    private dialogRef: MatDialogRef<LeaveApplyDialogComponent>,
  ) {
    this.form = this.fb.group({
      employeeId: [null, [Validators.required]],
      leaveTypeId: [null, [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      reason: [''],
    });
  }

  ngOnInit(): void {
    this.hrService.getEmployees(0, 100).subscribe({
      next: res => this.employees.set(res.data.content),
    });
    this.leaveService.getLeaveTypes().subscribe({
      next: res => this.leaveTypes.set(res.data),
    });
  }

  onEmployeeChange(employeeId: string): void {
    this.leaveService.initBalances(employeeId).subscribe({
      next: () => {
        this.leaveService.getBalances(employeeId).subscribe({
          next: res => this.balances.set(res.data),
        });
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');

    const val = { ...this.form.value };
    if (val.startDate instanceof Date) val.startDate = val.startDate.toISOString().split('T')[0];
    if (val.endDate instanceof Date) val.endDate = val.endDate.toISOString().split('T')[0];

    this.leaveService.applyLeave(val).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed to apply leave'); },
    });
  }
}
