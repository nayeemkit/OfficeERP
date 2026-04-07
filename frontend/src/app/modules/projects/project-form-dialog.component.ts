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
import { ProjectService } from '@core/services/project.service';
import { HrService } from '@core/services/hr.service';
import { ProjectResponse } from '@shared/models/project.model';
import { EmployeeResponse } from '@shared/models/hr.model';

@Component({
  selector: 'app-project-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'New Project' : 'Edit Project' }}</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width"><mat-label>Project Name</mat-label><input matInput formControlName="name" /></mat-form-field>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="3"></textarea></mat-form-field>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="sp" formControlName="startDate" /><mat-datepicker-toggle matSuffix [for]="sp"></mat-datepicker-toggle><mat-datepicker #sp></mat-datepicker></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="ep" formControlName="endDate" /><mat-datepicker-toggle matSuffix [for]="ep"></mat-datepicker-toggle><mat-datepicker #ep></mat-datepicker></mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="PLANNING">Planning</mat-option><mat-option value="IN_PROGRESS">In Progress</mat-option>
              <mat-option value="ON_HOLD">On Hold</mat-option><mat-option value="COMPLETED">Completed</mat-option>
            </mat-select></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="LOW">Low</mat-option><mat-option value="MEDIUM">Medium</mat-option>
              <mat-option value="HIGH">High</mat-option><mat-option value="CRITICAL">Critical</mat-option>
            </mat-select></mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Owner</mat-label>
          <mat-select formControlName="ownerId">
            <mat-option [value]="null">None</mat-option>
            @for (e of employees(); track e.id) { <mat-option [value]="e.id">{{ e.fullName }} ({{ e.employeeCode }})</mat-option> }
          </mat-select></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { {{ data.mode === 'create' ? 'Create' : 'Save' }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width{width:100%}.row{display:flex;gap:12px}.row mat-form-field{flex:1}.error-banner{background:#ffebee;color:#c62828;padding:12px;border-radius:4px;margin-bottom:16px}`],
})
export class ProjectFormDialogComponent implements OnInit {
  form: FormGroup; saving = signal(false); errorMessage = signal('');
  employees = signal<EmployeeResponse[]>([]);

  constructor(private fb: FormBuilder, private projectService: ProjectService, private hrService: HrService,
    private dialogRef: MatDialogRef<ProjectFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; project?: ProjectResponse }) {
    const isEdit = data.mode === 'edit'; const p = data.project;
    this.form = this.fb.group({
      name: [isEdit ? p?.name : '', [Validators.required]], description: [isEdit ? p?.description : ''],
      startDate: [isEdit && p?.startDate ? new Date(p.startDate) : null], endDate: [isEdit && p?.endDate ? new Date(p.endDate) : null],
      status: [isEdit ? p?.status : 'PLANNING'], priority: [isEdit ? p?.priority : 'MEDIUM'], ownerId: [isEdit ? p?.ownerId : null],
    });
  }

  ngOnInit() { this.hrService.getEmployees(0, 100).subscribe({ next: r => this.employees.set(r.data.content) }); }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true); this.errorMessage.set('');
    const val = { ...this.form.value };
    if (val.startDate instanceof Date) val.startDate = val.startDate.toISOString().split('T')[0];
    if (val.endDate instanceof Date) val.endDate = val.endDate.toISOString().split('T')[0];
    const obs = this.data.mode === 'edit' ? this.projectService.updateProject(this.data.project!.id, val) : this.projectService.createProject(val);
    obs.subscribe({ next: () => this.dialogRef.close(true), error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); } });
  }
}
