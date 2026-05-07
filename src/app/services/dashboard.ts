import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalClientes: number;
  totalPagado: number;
  totalPendiente: number;
  ticketsAbiertos: number;
  ultimosClientes: {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    plan: string;
    fecha_registro: string;
  }[];
  ultimasFacturas: {
    id: number;
    cliente: string;
    monto: number;
    estado: string;
    fecha_emision: string;
    fecha_vencimiento: string;
  }[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/stats`);
  }

  // Nuevo método para gráficas
  getStatsForCharts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats-charts`);
  }
}