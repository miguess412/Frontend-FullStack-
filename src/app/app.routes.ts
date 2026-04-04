import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { DashboardClienteComponent } from './components/dashboard-cliente/dashboard-cliente';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin/dashboard', component: DashboardComponent },
  { path: 'cliente/dashboard', component: DashboardClienteComponent },
  { path: '**', redirectTo: '/login' }
];