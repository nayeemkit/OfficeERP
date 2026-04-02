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
import { PayrollService } from '@core/services/payroll.service';
import { HrService } from '@core/services/hr.service';
import { EmployeeResponse } from '@shared/models/hr.model';

@Component({
  selector: 'app-salary-structure-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Salary Structure</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      @if (successMessage()) { <div class="success-banner">{{ successMessage() }}</div> }

      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Employee</mat-label>
          <mat-select formControlName="employeeId" (selectionChange)="onEmployeeChange($event.value)">
            @for (emp of employees(); track emp.id) {
              <mat-option [value]="emp.id">{{ emp.fullName }} ({{ emp.employeeCode }})</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <h3>Earnings</h3>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Basic Salary</mat-label>
            <input matInput formControlName="basicSalary" type="number" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>House Allowance</mat-label>
            <input matInput formControlName="houseAllowance" type="number" /></mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Transport Allowance</mat-label>
            <input matInput formControlName="transportAllowance" type="number" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Medical Allowance</mat-label>
            <input matInput formControlName="medicalAllowance" type="number" /></mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Other Allowance</mat-label>
          <input matInput formControlName="otherAllowance" type="number" /></mat-form-field>

        <h3>Deductions</h3>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Tax</mat-label>
            <input matInput formControlName="taxDeduction" type="number" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Insurance</mat-label>
            <input matInput formControlName="insuranceDeduction" type="number" /></mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Other Deductions</mat-label>
          <input matInput formControlName="otherDeduction" type="number" /></mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Effective from</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="effectiveFrom" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { Save }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
    h3 { margin: 16px 0 8px; font-size: 14px; color: #555; }
    .error-banner { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
    .success-banner { background: #e8f5e9; color: #2e7d32; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
  `],
})
export class SalaryStructureDialogComponent implements OnInit {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  employees = signal<EmployeeResponse[]>([]);

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private hrService: HrService,
    private dialogRef: MatDialogRef<SalaryStructureDialogComponent>,
  ) {
    this.form = this.fb.group({
      employeeId: [null, [Validators.required]],
      basicSalary: [0, [Validators.required, Validators.min(0)]],
      houseAllowance: [0],
      transportAllowance: [0],
      medicalAllowance: [0],
      otherAllowance: [0],
      taxDeduction: [0],
      insuranceDeduction: [0],
      otherDeduction: [0],
      effectiveFrom: [new Date(), [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.hrService.getEmployees(0, 100).subscribe({ next: res => this.employees.set(res.data.content) });
  }

  onEmployeeChange(employeeId: string): void {
    this.payrollService.getSalaryStructure(employeeId).subscribe({
      next: res => {
        const ss = res.data;
        this.form.patchValue({
          basicSalary: ss.basicSalary,
          houseAllowance: ss.houseAllowance,
          transportAllowance: ss.transportAllowance,
          medicalAllowance: ss.medicalAllowance,
          otherAllowance: ss.otherAllowance,
          taxDeduction: ss.taxDeduction,
          insuranceDeduction: ss.insuranceDeduction,
          otherDeduction: ss.otherDeduction,
        });
      },
      error: () => {},
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const val = { ...this.form.value };
    if (val.effectiveFrom instanceof Date) val.effectiveFrom = val.effectiveFrom.toISOString().split('T')[0];

    this.payrollService.saveSalaryStructure(val).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Salary structure saved successfully!');
      },
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); },
    });
  }
}
