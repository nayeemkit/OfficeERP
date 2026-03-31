import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '@core/services/user.service';
import { UserResponse } from '@shared/models/user.model';

interface DialogData {
  mode: 'create' | 'edit';
  user?: UserResponse;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create User' : 'Edit User' }}</h2>

    <mat-dialog-content>
      @if (errorMessage()) {
        <div class="error-banner">{{ errorMessage() }}</div>
      }

      <form [formGroup]="form">
        <div class="name-row">
          <mat-form-field appearance="outline">
            <mat-label>First name</mat-label>
            <input matInput formControlName="firstName" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Last name</mat-label>
            <input matInput formControlName="lastName" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ data.mode === 'create' ? 'Password' : 'New password (leave blank to keep)' }}</mat-label>
          <input matInput formControlName="password" type="password" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option value="ADMIN">Admin</mat-option>
            <mat-option value="MANAGER">Manager</mat-option>
            <mat-option value="EMPLOYEE">Employee</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary"
              (click)="onSubmit()"
              [disabled]="form.invalid || saving()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ data.mode === 'create' ? 'Create' : 'Save' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .name-row { display: flex; gap: 12px; }
    .name-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
    .error-banner {
      background: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
    }
  `],
})
export class UserFormDialogComponent {
  form: FormGroup;
  saving = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    const isEdit = data.mode === 'edit';
    const user = data.user;

    this.form = this.fb.group({
      firstName: [isEdit ? user?.firstName : '', [Validators.required]],
      lastName: [isEdit ? user?.lastName : '', [Validators.required]],
      email: [isEdit ? user?.email : '', [Validators.required, Validators.email]],
      password: ['', isEdit ? [] : [Validators.required, Validators.minLength(8)]],
      role: [isEdit ? user?.role : 'EMPLOYEE', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    this.errorMessage.set('');

    const formValue = { ...this.form.value };

    if (this.data.mode === 'edit') {
      // Remove empty password for edit
      if (!formValue.password) {
        delete formValue.password;
      }

      this.userService.updateUser(this.data.user!.id, formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err.error?.message || 'Update failed');
        },
      });
    } else {
      this.userService.createUser(formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err.error?.message || 'Creation failed');
        },
      });
    }
  }
}
