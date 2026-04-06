import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AssetService } from '@core/services/asset.service';
import { HrService } from '@core/services/hr.service';
import { AssetResponse } from '@shared/models/asset.model';
import { EmployeeResponse } from '@shared/models/hr.model';

@Component({
  selector: 'app-asset-assign-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Assign Asset</h2>
    <mat-dialog-content>
      @if (errorMessage()) { <div class="error-banner">{{ errorMessage() }}</div> }
      <div class="asset-info"><p><strong>{{ data.asset.name }}</strong> ({{ data.asset.assetCode }})</p></div>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width"><mat-label>Assign to Employee</mat-label>
          <mat-select formControlName="employeeId">
            @for (emp of employees(); track emp.id) { <mat-option [value]="emp.id">{{ emp.fullName }} ({{ emp.employeeCode }})</mat-option> }
          </mat-select></mat-form-field>
        <mat-form-field appearance="outline" class="full-width"><mat-label>Note (optional)</mat-label>
          <input matInput formControlName="note" /></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { Assign }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width{width:100%}.asset-info{margin-bottom:16px;padding:12px;background:#f5f5f5;border-radius:8px}.asset-info p{margin:4px 0}.error-banner{background:#ffebee;color:#c62828;padding:12px;border-radius:4px;margin-bottom:16px}`],
})
export class AssetAssignDialogComponent implements OnInit {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');
  employees = signal<EmployeeResponse[]>([]);

  constructor(
    private fb: FormBuilder, private assetService: AssetService, private hrService: HrService,
    private dialogRef: MatDialogRef<AssetAssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { asset: AssetResponse },
  ) {
    this.form = this.fb.group({ employeeId: [null, [Validators.required]], note: [''] });
  }

  ngOnInit() { this.hrService.getEmployees(0, 100).subscribe({ next: r => this.employees.set(r.data.content) }); }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true); this.errorMessage.set('');
    this.assetService.assign(this.data.asset.id, this.form.value).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => { this.saving.set(false); this.errorMessage.set(err.error?.message || 'Failed'); },
    });
  }
}
