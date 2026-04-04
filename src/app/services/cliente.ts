import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FacturaCliente {
  id: number;
  monto: number;
  estado: string;
  fecha_emision: string;
  fecha_vencimiento: string;
}

export interface PlanCliente {
  id: number;
  nombre: string;
  velocidad: string;
  precio: number;
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
  private apiUrl = 'http://localhost:3000/api/cliente';

  constructor(private http: HttpClient) {}

  getMisFacturas(): Observable<FacturaCliente[]> {
    return this.http.get<FacturaCliente[]>(`${this.apiUrl}/facturas`);
  }

  getMiPlan(): Observable<PlanCliente> {
    return this.http.get<PlanCliente>(`${this.apiUrl}/plan`);
  }

  crearTicket(ticket: TicketSoporte): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets`, ticket);
  }

  pagarFactura(facturaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagar`, { facturaId });
  }
}