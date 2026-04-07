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
import { EmployeeResponse } from '@shared/models/hr.model';

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Add Task</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width"><mat-label>Title</mat-label><input matInput formControlName="title" /></mat-form-field>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="2"></textarea></mat-form-field>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Assignee</mat-label>
            <mat-select formControlName="assigneeId"><mat-option [value]="null">Unassigned</mat-option>
              @for (e of employees(); track e.id) { <mat-option [value]="e.id">{{ e.fullName }}</mat-option> }
            </mat-select></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="LOW">Low</mat-option><mat-option value="MEDIUM">Medium</mat-option>
              <mat-option value="HIGH">High</mat-option><mat-option value="CRITICAL">Critical</mat-option>
            </mat-select></mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Due Date</mat-label>
            <input matInput [matDatepicker]="dp" formControlName="dueDate" /><mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle><mat-datepicker #dp></mat-datepicker></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Estimated Hours</mat-label><input matInput formControlName="estimatedHours" type="number" /></mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { Create }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width{width:100%}.row{display:flex;gap:12px}.row mat-form-field{flex:1}.error-banner{background:#ffebee;color:#c62828;padding:12px;border-radius:4px;margin-bottom:16px}`],
})
export class TaskFormDialogComponent implements OnInit {
  form: FormGroup; saving = signal(false); errorMessage = signal('');
  employees = signal<EmployeeResponse[]>([]);

  constructor(private fb: FormBuilder, private projectService: ProjectService, private hrService: HrService,
    private dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: string }) {
    this.form = this.fb.group({
      title: ['', [Validators.required]], description: [''], assigneeId: [null],
      priority: ['MEDIUM'], dueDate: [null], estimatedHours: [null],
    });
  }

  ngOnInit() { this.hrService.getEmployees(0, 100).subscribe({ next: r => this.employees.set(r.data.content) }); }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true); this.errorMessage.set('');
    const val = { ...this.form.value, projectId: this.data.projectId };
    if (val.dueDate instanceof Date) val.dueDate = val.dueDate.toISOString().split('T')[0];
    this.projectService.createTask(val).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); },
    });
  }
}
