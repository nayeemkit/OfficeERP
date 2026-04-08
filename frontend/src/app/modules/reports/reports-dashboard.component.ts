import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ReportsService } from '@core/services/reports.service';
import { DashboardKPI } from '@shared/models/reports.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatDividerModule],
  template: `
    @if (loading()) {
      <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
    } @else if (kpi()) {
      <div class="reports-page">
        <h2>Dashboard Overview</h2>

        <!-- KPI Cards -->
        <div class="kpi-grid">
          <mat-card class="kpi-card" routerLink="/hr/employees">
            <mat-icon class="kpi-icon blue">people</mat-icon>
            <div class="kpi-value">{{ kpi()!.activeEmployees }}/{{ kpi()!.totalEmployees }}</div>
            <div class="kpi-label">Active Employees</div>
          </mat-card>
          <mat-card class="kpi-card" routerLink="/hr/attendance">
            <mat-icon class="kpi-icon green">login</mat-icon>
            <div class="kpi-value">{{ kpi()!.checkedInToday }}</div>
            <div class="kpi-label">Checked In Today</div>
          </mat-card>
          <mat-card class="kpi-card" routerLink="/hr/leave">
            <mat-icon class="kpi-icon orange">event_busy</mat-icon>
            <div class="kpi-value">{{ kpi()!.pendingLeaveRequests }}</div>
            <div class="kpi-label">Pending Leave Requests</div>
          </mat-card>
          <mat-card class="kpi-card" routerLink="/inventory/items">
            <mat-icon class="kpi-icon red">warning</mat-icon>
            <div class="kpi-value">{{ kpi()!.lowStockItems }}</div>
            <div class="kpi-label">Low Stock Alerts</div>
          </mat-card>
          <mat-card class="kpi-card" routerLink="/finance/expenses">
            <mat-icon class="kpi-icon orange">receipt_long</mat-icon>
            <div class="kpi-value">{{ kpi()!.pendingExpenseCount }}</div>
            <div class="kpi-label">Pending Expenses</div>
          </mat-card>
          <mat-card class="kpi-card" routerLink="/finance/invoices">
            <mat-icon class="kpi-icon red">schedule</mat-icon>
            <div class="kpi-value">{{ kpi()!.overdueInvoices }}</div>
            <div class="kpi-label">Overdue Invoices</div>
          </mat-card>
          <mat-card class="kpi-card" routerLink="/projects">
            <mat-icon class="kpi-icon blue">assignment</mat-icon>
            <div class="kpi-value">{{ kpi()!.activeProjects }}/{{ kpi()!.totalProjects }}</div>
            <div class="kpi-label">Active Projects</div>
          </mat-card>
          <mat-card class="kpi-card" routerLink="/inventory/assets">
            <mat-icon class="kpi-icon green">devices</mat-icon>
            <div class="kpi-value">{{ kpi()!.assignedAssets }}/{{ kpi()!.totalAssets }}</div>
            <div class="kpi-label">Assigned Assets</div>
          </mat-card>
        </div>

        <!-- Financial Summary -->
        <div class="section-title">Financial Summary</div>
        <div class="finance-grid">
          <mat-card class="finance-card">
            <div class="fin-label">Approved Expenses</div>
            <div class="fin-value green-text">{{ kpi()!.totalApprovedExpenses | number:'1.2-2' }}</div>
          </mat-card>
          <mat-card class="finance-card">
            <div class="fin-label">Pending Expenses</div>
            <div class="fin-value orange-text">{{ kpi()!.totalPendingExpenses | number:'1.2-2' }}</div>
          </mat-card>
          <mat-card class="finance-card">
            <div class="fin-label">Invoice Paid</div>
            <div class="fin-value green-text">{{ kpi()!.totalInvoicePaid | number:'1.2-2' }}</div>
          </mat-card>
          <mat-card class="finance-card">
            <div class="fin-label">Invoice Outstanding</div>
            <div class="fin-value orange-text">{{ kpi()!.totalInvoiceOutstanding | number:'1.2-2' }}</div>
          </mat-card>
        </div>

        <!-- Charts Row -->
        <div class="charts-grid">
          <mat-card class="chart-card">
            <div class="chart-title">Department Headcount</div>
            <canvas #deptChart></canvas>
          </mat-card>
          <mat-card class="chart-card">
            <div class="chart-title">Project Status</div>
            <canvas #projectChart></canvas>
          </mat-card>
          <mat-card class="chart-card wide">
            <div class="chart-title">Attendance This Week</div>
            <canvas #attendanceChart></canvas>
          </mat-card>
        </div>
      </div>
    }
  `,
  styles: [`
    .reports-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
    h2 { margin: 0 0 20px; }
    .loading { display: flex; justify-content: center; padding: 80px; }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .kpi-card { padding: 20px; text-align: center; cursor: pointer; transition: box-shadow .2s; }
    .kpi-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.15); }
    .kpi-icon { font-size: 32px; width: 40px; height: 40px; margin-bottom: 8px; }
    .kpi-icon.blue { color: #1565c0; } .kpi-icon.green { color: #2e7d32; }
    .kpi-icon.orange { color: #e65100; } .kpi-icon.red { color: #c62828; }
    .kpi-value { font-size: 28px; font-weight: 600; }
    .kpi-label { font-size: 13px; color: #666; margin-top: 4px; }

    .section-title { font-size: 18px; font-weight: 500; margin: 8px 0 16px; }
    .finance-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .finance-card { padding: 20px; text-align: center; }
    .fin-label { font-size: 13px; color: #666; margin-bottom: 4px; }
    .fin-value { font-size: 24px; font-weight: 600; }
    .green-text { color: #2e7d32; } .orange-text { color: #e65100; }

    .charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px; }
    .chart-card { padding: 20px; }
    .chart-card.wide { grid-column: 1 / -1; }
    .chart-title { font-size: 15px; font-weight: 500; margin-bottom: 12px; }
    canvas { max-height: 300px; }
  `],
})
export class ReportsDashboardComponent implements OnInit {
  kpi = signal<DashboardKPI | null>(null);
  loading = signal(true);

  @ViewChild('deptChart') deptChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('projectChart') projectChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('attendanceChart') attendanceChartRef!: ElementRef<HTMLCanvasElement>;

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.reportsService.getDashboardKPI().subscribe({
      next: res => {
        this.kpi.set(res.data);
        this.loading.set(false);
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => this.loading.set(false),
    });
  }

  private renderCharts(): void {
    const data = this.kpi();
    if (!data) return;

    // Department Headcount - Bar Chart
    if (this.deptChartRef && data.departmentHeadcounts.length > 0) {
      new Chart(this.deptChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: data.departmentHeadcounts.map(d => d.departmentName),
          datasets: [{
            label: 'Employees',
            data: data.departmentHeadcounts.map(d => d.count),
            backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc', '#26c6da'],
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
        },
      });
    }

    // Project Status - Doughnut Chart
    if (this.projectChartRef && data.projectStatusCounts.length > 0) {
      const statusColors: Record<string, string> = {
        PLANNING: '#9e9e9e', IN_PROGRESS: '#42a5f5', ON_HOLD: '#ffa726',
        COMPLETED: '#66bb6a', CANCELLED: '#ef5350',
      };
      new Chart(this.projectChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: data.projectStatusCounts.map(p => p.status.replace('_', ' ')),
          datasets: [{
            data: data.projectStatusCounts.map(p => p.count),
            backgroundColor: data.projectStatusCounts.map(p => statusColors[p.status] || '#9e9e9e'),
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
        },
      });
    }

    // Attendance This Week - Line Chart
    if (this.attendanceChartRef && data.attendanceThisWeek) {
      const days = Object.keys(data.attendanceThisWeek);
      const counts = Object.values(data.attendanceThisWeek);
      new Chart(this.attendanceChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: days,
          datasets: [{
            label: 'Checked In',
            data: counts,
            borderColor: '#42a5f5',
            backgroundColor: 'rgba(66, 165, 245, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: '#42a5f5',
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
        },
      });
    }
  }
}
