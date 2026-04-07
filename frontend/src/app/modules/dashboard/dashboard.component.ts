import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <mat-toolbar color="primary">
      <span>Office ERP</span><span class="spacer"></span>
      <span class="user-info">{{ authService.user()?.fullName }} ({{ authService.user()?.role }})</span>
      <button mat-icon-button (click)="authService.logout()"><mat-icon>logout</mat-icon></button>
    </mat-toolbar>
    <div class="content">
      <h2>Welcome, {{ authService.user()?.fullName }}!</h2>
      <div class="grid">
        @if (authService.hasAnyRole('ADMIN', 'MANAGER')) {
          <mat-card class="card" routerLink="/users"><mat-icon class="ci">manage_accounts</mat-icon><mat-card-title>Users</mat-card-title><mat-card-subtitle>Manage users & roles</mat-card-subtitle></mat-card>
          <mat-card class="card" routerLink="/hr/departments"><mat-icon class="ci">business</mat-icon><mat-card-title>Departments</mat-card-title><mat-card-subtitle>Manage departments</mat-card-subtitle></mat-card>
          <mat-card class="card" routerLink="/hr/employees"><mat-icon class="ci">badge</mat-icon><mat-card-title>Employees</mat-card-title><mat-card-subtitle>Employee directory</mat-card-subtitle></mat-card>
          <mat-card class="card" routerLink="/hr/leave"><mat-icon class="ci">event_available</mat-icon><mat-card-title>Leave</mat-card-title><mat-card-subtitle>Apply, approve leave</mat-card-subtitle></mat-card>
          <mat-card class="card" routerLink="/hr/attendance"><mat-icon class="ci">schedule</mat-icon><mat-card-title>Attendance</mat-card-title><mat-card-subtitle>Check-in/out, hours</mat-card-subtitle></mat-card>
          <mat-card class="card" routerLink="/hr/payroll"><mat-icon class="ci">payments</mat-icon><mat-card-title>Payroll</mat-card-title><mat-card-subtitle>Salary, payslips, PDF</mat-card-subtitle></mat-card>
        }
        <mat-card class="card" routerLink="/inventory/items"><mat-icon class="ci">inventory_2</mat-icon><mat-card-title>Inventory</mat-card-title><mat-card-subtitle>Items, stock, alerts</mat-card-subtitle></mat-card>
        <mat-card class="card" routerLink="/inventory/stock"><mat-icon class="ci">swap_horiz</mat-icon><mat-card-title>Stock</mat-card-title><mat-card-subtitle>Stock in/out trail</mat-card-subtitle></mat-card>
        <mat-card class="card" routerLink="/inventory/assets"><mat-icon class="ci">devices</mat-icon><mat-card-title>Assets</mat-card-title><mat-card-subtitle>Register, assign, track</mat-card-subtitle></mat-card>
        <mat-card class="card" routerLink="/finance/expenses"><mat-icon class="ci">receipt_long</mat-icon><mat-card-title>Expenses</mat-card-title><mat-card-subtitle>Submit & approve</mat-card-subtitle></mat-card>
        <mat-card class="card" routerLink="/finance/invoices"><mat-icon class="ci">description</mat-icon><mat-card-title>Invoices</mat-card-title><mat-card-subtitle>Create & track invoices</mat-card-subtitle></mat-card>
        <mat-card class="card" routerLink="/finance/budgets"><mat-icon class="ci">account_balance</mat-icon><mat-card-title>Budgets</mat-card-title><mat-card-subtitle>Dept budget management</mat-card-subtitle></mat-card>
        <mat-card class="card"><mat-icon class="ci">assignment</mat-icon><mat-card-title>Projects</mat-card-title><mat-card-subtitle>Coming in Milestone 13</mat-card-subtitle></mat-card>
      </div>
    </div>
  `,
  styles: [`
    .spacer{flex:1}.user-info{font-size:14px;margin-right:12px;opacity:.9}
    .content{padding:24px;max-width:1200px;margin:0 auto}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-top:16px}
    .card{cursor:pointer;padding:24px;transition:box-shadow .2s}.card:hover{box-shadow:0 4px 12px rgba(0,0,0,.15)}
    .ci{font-size:36px;width:40px;height:40px;color:#3f51b5;margin-bottom:12px}
  `],
})
export class DashboardComponent {
  constructor(public authService: AuthService) {}
}
