import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { DashboardClienteComponent } from './components/dashboard-cliente/dashboard-cliente';
import { ClientesComponent } from './components/admin/clientes/clientes';
import { PagoExitosoComponent } from './components/pago-exitoso/pago-exitoso';
import { PagoCanceladoComponent } from './components/pago-cancelado/pago-cancelado';
import { PagoRetornoComponent } from './components/pago-retorno/pago-retorno';
import { ClienteTicketsComponent } from './components/cliente-tickets/cliente-tickets';
import { AdminTicketsComponent } from './components/admin-tickets/admin-tickets';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin/dashboard', component: DashboardComponent },
  { path: 'admin/clientes', component: ClientesComponent },
  { path: 'cliente/dashboard', component: DashboardClienteComponent },
  { path: 'pago-retorno', component: PagoRetornoComponent },
  { path: 'pago-exitoso', component: PagoExitosoComponent },
  { path: 'pago-cancelado', component: PagoCanceladoComponent },
  { path: 'cliente/tickets', component: ClienteTicketsComponent },
  { path: 'admin/tickets', component: AdminTicketsComponent },
  { path: '**', redirectTo: '/login' }
];