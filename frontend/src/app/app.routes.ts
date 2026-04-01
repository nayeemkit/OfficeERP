import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./modules/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadComponent: () => import('./modules/users/user-list.component').then(m => m.UserListComponent),
    canActivate: [authGuard, roleGuard('ADMIN', 'MANAGER')],
  },
  {
    path: 'hr/departments',
    loadComponent: () => import('./modules/hr/departments/department-list.component').then(m => m.DepartmentListComponent),
    canActivate: [authGuard, roleGuard('ADMIN', 'MANAGER')],
  },
  {
    path: 'hr/employees',
    loadComponent: () => import('./modules/hr/employees/employee-list.component').then(m => m.EmployeeListComponent),
    canActivate: [authGuard, roleGuard('ADMIN', 'MANAGER')],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
