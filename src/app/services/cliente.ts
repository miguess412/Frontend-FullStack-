import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FacturaCliente {
  id: number;
  monto: number;
  estado: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  fecha_pago?: string | null;
}

export interface PlanCliente {
  id: number;
  nombre: string;
  velocidad: string;
  precio: number;
  descripcion?: string;
  activo?: boolean;
}

export interface ConsumoCliente {
  clienteId: number;
  planNombre: string;
  velocidad: string;
  gigasConsumidos: number;
  gigasTotales: number;
  porcentajeConsumo: number;
  diasRestantesCiclo: number;
  estadoServicio: string;
  periodo: string;
}

export interface TicketSoporte {
  asunto: string;
  descripcion: string;
  prioridad: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl || 'http://localhost:3000/api'}/cliente`;
  private planesUrl = `${environment.apiUrl || 'http://localhost:3000/api'}/planes`;

  constructor(private http: HttpClient) {}

  getMisFacturas(): Observable<FacturaCliente[]> {
    return this.http.get<FacturaCliente[]>(`${this.apiUrl}/facturas`);
  }

  getMiPlan(): Observable<PlanCliente> {
    return this.http.get<PlanCliente>(`${this.apiUrl}/plan`);
  }

  getMiConsumo(): Observable<ConsumoCliente> {
    return this.http.get<ConsumoCliente>(`${this.apiUrl}/consumo`);
  }

  cambiarMiPlan(nuevoPlanId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cambiar-plan`, { nuevoPlanId });
  }

  getPlanesDisponibles(): Observable<PlanCliente[]> {
    return this.http.get<PlanCliente[]>(this.planesUrl);
  }

  crearTicket(ticket: TicketSoporte): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets`, ticket);
  }

  pagarFactura(facturaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagar`, { facturaId });
  }
}