import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HrService } from '@core/services/hr.service';
import { EmployeeResponse, DepartmentResponse, DesignationResponse } from '@shared/models/hr.model';

interface DialogData {
  mode: 'create' | 'edit';
  employee?: EmployeeResponse;
}

@Component({
  selector: 'app-employee-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Employee' : 'Edit Employee' }}</h2>

    <mat-dialog-content>
      @if (errorMessage()) {
        <div class="error-banner">{{ errorMessage() }}</div>
      }

      <form [formGroup]="form">
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>First name</mat-label>
            <input matInput formControlName="firstName" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Last name</mat-label>
            <input matInput formControlName="lastName" />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Department</mat-label>
            <mat-select formControlName="departmentId" (selectionChange)="onDepartmentChange($event.value)">
              @for (dept of departments(); track dept.id) {
                <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Designation</mat-label>
            <mat-select formControlName="designationId">
              <mat-option [value]="null">None</mat-option>
              @for (desig of designations(); track desig.id) {
                <mat-option [value]="desig.id">{{ desig.title }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Join date</mat-label>
            <input matInput [matDatepicker]="joinPicker" formControlName="joinDate" />
            <mat-datepicker-toggle matSuffix [for]="joinPicker"></mat-datepicker-toggle>
            <mat-datepicker #joinPicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Salary</mat-label>
            <input matInput formControlName="salary" type="number" />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Employment type</mat-label>
            <mat-select formControlName="employmentType">
              <mat-option value="FULL_TIME">Full Time</mat-option>
              <mat-option value="PART_TIME">Part Time</mat-option>
              <mat-option value="CONTRACT">Contract</mat-option>
              <mat-option value="INTERN">Intern</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Gender</mat-label>
            <mat-select formControlName="gender">
              <mat-option [value]="null">Prefer not to say</mat-option>
              <mat-option value="MALE">Male</mat-option>
              <mat-option value="FEMALE">Female</mat-option>
              <mat-option value="OTHER">Other</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (data.mode === 'edit') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="ACTIVE">Active</mat-option>
              <mat-option value="ON_LEAVE">On Leave</mat-option>
              <mat-option value="RESIGNED">Resigned</mat-option>
              <mat-option value="TERMINATED">Terminated</mat-option>
            </mat-select>
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Address</mat-label>
          <textarea matInput formControlName="address" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ data.mode === 'create' ? 'Create' : 'Save' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
    .error-banner {
      background: #ffebee; color: #c62828;
      padding: 12px 16px; border-radius: 4px; margin-bottom: 16px; font-size: 14px;
    }
  `],
})
export class EmployeeFormDialogComponent implements OnInit {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');
  departments = signal<DepartmentResponse[]>([]);
  designations = signal<DesignationResponse[]>([]);

  constructor(
    private fb: FormBuilder,
    private hrService: HrService,
    private dialogRef: MatDialogRef<EmployeeFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    const isEdit = data.mode === 'edit';
    const emp = data.employee;

    this.form = this.fb.group({
      firstName: [isEdit ? emp?.firstName : '', [Validators.required]],
      lastName: [isEdit ? emp?.lastName : '', [Validators.required]],
      email: [isEdit ? emp?.email : '', [Validators.required, Validators.email]],
      phone: [isEdit ? emp?.phone : ''],
      departmentId: [isEdit ? emp?.departmentId : null, [Validators.required]],
      designationId: [isEdit ? emp?.designationId : null],
      joinDate: [isEdit ? new Date(emp!.joinDate) : new Date(), [Validators.required]],
      salary: [isEdit ? emp?.salary : 0],
      employmentType: [isEdit ? emp?.employmentType : 'FULL_TIME'],
      gender: [isEdit ? emp?.gender : null],
      status: [isEdit ? emp?.status : 'ACTIVE'],
      address: [isEdit ? emp?.address : ''],
    });
  }

  ngOnInit(): void {
    this.hrService.getActiveDepartments().subscribe({
      next: res => {
        this.departments.set(res.data);
        if (this.data.mode === 'edit' && this.data.employee?.departmentId) {
          this.loadDesignations(this.data.employee.departmentId);
        }
      },
    });
  }

  onDepartmentChange(departmentId: string): void {
    this.form.patchValue({ designationId: null });
    this.loadDesignations(departmentId);
  }

  loadDesignations(departmentId: string): void {
    this.hrService.getDesignationsByDepartment(departmentId).subscribe({
      next: res => this.designations.set(res.data),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');

    const formValue = { ...this.form.value };
    if (formValue.joinDate instanceof Date) {
      formValue.joinDate = formValue.joinDate.toISOString().split('T')[0];
    }

    if (this.data.mode === 'edit') {
      this.hrService.updateEmployee(this.data.employee!.id, formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Update failed'); },
      });
    } else {
      this.hrService.createEmployee(formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Creation failed'); },
      });
    }
  }
}
