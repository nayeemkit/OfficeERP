import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./modules/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'users', loadComponent: () => import('./modules/users/user-list.component').then(m => m.UserListComponent), canActivate: [authGuard, roleGuard('ADMIN', 'MANAGER')] },
  { path: 'hr/departments', loadComponent: () => import('./modules/hr/departments/department-list.component').then(m => m.DepartmentListComponent), canActivate: [authGuard, roleGuard('ADMIN', 'MANAGER')] },
  { path: 'hr/employees', loadComponent: () => import('./modules/hr/employees/employee-list.component').then(m => m.EmployeeListComponent), canActivate: [authGuard, roleGuard('ADMIN', 'MANAGER')] },
  { path: 'hr/leave', loadComponent: () => import('./modules/hr/leave/leave-list.component').then(m => m.LeaveListComponent), canActivate: [authGuard, roleGuard('ADMIN', 'MANAGER')] },
  { path: 'hr/attendance', loadComponent: () => import('./modules/hr/attendance/attendance-list.component').then(m => m.AttendanceListComponent), canActivate: [authGuard, roleGuard('ADMIN', 'MANAGER')] },
  { path: 'hr/payroll', loadComponent: () => import('./modules/hr/payroll/payroll-list.component').then(m => m.PayrollListComponent), canActivate: [authGuard, roleGuard('ADMIN', 'MANAGER')] },
  { path: 'inventory/items', loadComponent: () => import('./modules/inventory/items/item-list.component').then(m => m.ItemListComponent), canActivate: [authGuard] },
  { path: 'inventory/stock', loadComponent: () => import('./modules/inventory/stock/stock-list.component').then(m => m.StockListComponent), canActivate: [authGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
