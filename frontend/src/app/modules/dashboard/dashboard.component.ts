import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Office ERP</span>
      <span class="spacer"></span>
      <span class="user-info">{{ authService.user()?.fullName }} ({{ authService.user()?.role }})</span>
      <button mat-icon-button (click)="authService.logout()" matTooltip="Logout">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="dashboard-content">
      <h2>Welcome, {{ authService.user()?.fullName }}!</h2>

      <div class="card-grid">
        @if (authService.hasAnyRole('ADMIN', 'MANAGER')) {
          <mat-card class="module-card" routerLink="/users">
            <mat-card-header>
              <mat-icon mat-card-avatar class="card-icon">manage_accounts</mat-icon>
              <mat-card-title>User Management</mat-card-title>
              <mat-card-subtitle>Create, edit, manage users</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Manage system users and roles</p>
            </mat-card-content>
          </mat-card>
        }

        <mat-card class="module-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon">people</mat-icon>
            <mat-card-title>HR Module</mat-card-title>
            <mat-card-subtitle>Employees, Leave, Attendance</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Coming in Milestone 5-8</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="module-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon">inventory_2</mat-icon>
            <mat-card-title>Inventory</mat-card-title>
            <mat-card-subtitle>Items, Stock, Assets</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Coming in Milestone 9-10</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="module-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon">account_balance</mat-icon>
            <mat-card-title>Finance</mat-card-title>
            <mat-card-subtitle>Expenses, Invoices, Budget</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Coming in Milestone 11-12</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="module-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon">assignment</mat-icon>
            <mat-card-title>Projects</mat-card-title>
            <mat-card-subtitle>Tasks, Milestones</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Coming in Milestone 13</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .user-info {
      font-size: 14px;
      margin-right: 12px;
      opacity: 0.9;
    }
    .dashboard-content {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    .module-card { cursor: pointer; transition: box-shadow 0.2s; }
    .module-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .card-icon {
      font-size: 32px;
      width: 40px;
      height: 40px;
      color: #3f51b5;
    }
  `],
})
export class DashboardComponent {
  constructor(public authService: AuthService) {}
}
